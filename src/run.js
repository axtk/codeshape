#!/usr/bin/env node
/* eslint-disable no-console */

const {existsSync, readdirSync, unlinkSync, writeFileSync} = require('fs');
const {join} = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

let args = process.argv.slice(2);
let cwd = process.cwd();

let tempTsConfigFileName = 'tsconfig.codeshape.json';

function getList(dir) {
    let dirPath = join(__dirname, '..', dir);

    if (!existsSync(dirPath))
        return [];

    return readdirSync(dirPath).reduce((list, name) => {
        if (name.endsWith('.js'))
            list.push(name.slice(0, -3));

        return list;
    }, []);
}

const presetKeys = getList('presets');
const configKeys = getList('configs');

const stylelintConfigKeys = ['css'];

function showGuide() {
    console.log();
    console.log('Options:');
    console.log('  --<config_key> <dir1> <dir2> ...');
    console.log('  --<preset_key> (experimental, currently unused)');
    console.log('  --fix');
    console.log('  --debug');
    console.log('  --config <path> | -c <path>');
    console.log('  --ignore-config (ignore config file)');
    console.log('  --explicit-exit-code | -x (fail with exit code 1)');
    console.log('  --sequential (rather than in parallel, which is default)');
    showConfigKeys();
}

function showConfigKeys() {
    console.log('\nAvailable config keys: ');
    console.log(configKeys.map(key => `  ${key}`).join('\n'));
}

function getConfig() {
    let argConfig = {};
    let configKey, configPath;

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg.startsWith('--')) {
            let key = arg.slice(2);

            configKey = configKeys.includes(key) ? key : null;

            if (configKey)
                argConfig[configKey] ??= [];
            else if (key === 'config' && args[i + 1])
                configPath = join(cwd, args[i + 1]);
            else if (['fix', 'debug', 'sequential'].includes(key))
                argConfig[key] = true;
            else if (presetKeys.includes(key))
                configPath = join(__dirname, `../presets/${key}.js`);
        }
        else if (arg.startsWith('-') && arg.length === 2) {
            let key = arg.slice(1);

            if (key === 'c' && args[i + 1])
                configPath = join(cwd, args[i + 1]);
        }
        else if (configKey)
            argConfig[configKey].push(arg);
    }

    if (args.includes('--explicit-exit-code') || args.includes('-x'))
        argConfig.explicitExitCode = true;

    let fileConfig = {};

    try {
        if (configPath)
            fileConfig = require(configPath);
        else if (!args.includes('--ignore-config'))
            fileConfig = require(join(cwd, './.lintrc'));
    }
    catch {}

    return {...fileConfig, ...argConfig};
}

function createDebugEslintConfig(key, configPath) {
    try {
        console.log();
        console.log('Eslint config:');
        console.log(configPath);

        if (configPath) {
            let eslintConfig = require(configPath);
            let path = join(cwd, `debug_eslint_config.${key}.json`);

            writeFileSync(path, JSON.stringify(eslintConfig, null, 4));

            console.log(`>> ${path}`);
        }
    }
    catch (error) {
        console.log();
        console.log(error);
    }
}

function createTempTsConfig(dirs, config) {
    try {
        let tsConfig;

        try {
            tsConfig = require('./tsconfig.json');
        }
        catch {
            tsConfig = {};
        }

        let tempTsConfigFilePath = join(cwd, tempTsConfigFileName);

        let codeExt = '{js,jsx,ts,tsx}';
        let mdExt = `md/*.${codeExt}`;

        let codeIncludes = dirs.length
            ? dirs.map(dir => `${dir}/**/*.${codeExt}`)
            : [`*.${codeExt}`];

        let mdIncludes = dirs.length
            ? dirs.map(dir => `${dir}/**/*.${mdExt}`)
            : [`*.${mdExt}`];

        let tempTsConfig = {
            extends: './tsconfig.json',
            includes: [
                ...codeIncludes,
                ...mdIncludes,
            ],
            exludes: tsConfig.excludes ?? [],
        };

        if (config.debug) {
            console.log();
            console.log('Temp tsconfig:');
            console.log(JSON.stringify(tempTsConfig, null, 2));
        }

        writeFileSync(tempTsConfigFilePath, JSON.stringify(tempTsConfig, null, 4));

        if (config.debug)
            console.log(`>> ${tempTsConfigFilePath}`);
    }
    catch (error) {
        if (config.debug) {
            console.log();
            console.log('Failed to create temp tsconfig');
            console.log(error);
        }
    }
}

function removeTempTsConfig(config) {
    try {
        let tempTsConfigFilePath = join(cwd, tempTsConfigFileName);

        if (existsSync(tempTsConfigFilePath)) {
            unlinkSync(tempTsConfigFilePath);

            if (config.debug) {
                console.log();
                console.log('Removed temp tsconfig:');
                console.log(`<< ${tempTsConfigFilePath}`);
            }
        }
    }
    catch (error) {
        if (config.debug) {
            console.log();
            console.log('Failed to remove temp tsconfig');
            console.log(error);
        }
    }
}

function getBin(name) {
    let ownBin = join(__dirname, `../node_modules/.bin/${name}`);

    if (existsSync(ownBin))
        return ownBin;

    let packageConfig = require(join(__dirname, '../package.json'));
    let version = packageConfig.dependencies[name];

    return `npx ${name}@${version}`;
}

async function execConfigEntry(key, dirs, config) {
    let configPath = join(__dirname, `../configs/${key}.js`);
    let cmd, tsMode = false;

    if (stylelintConfigKeys.includes(key)) {
        let root = dirs.length > 1 ? `(${dirs.join('|')})` : dirs.join() || '.';
        let target = `"${root}/**/*.${key === 'scss' ? '(css|scss)' : 'css'}"`;

        cmd = `${getBin('stylelint')} --config ${configPath} ${target}` +
            (config.fix ? ' --fix' : '');
    }
    else {
        tsMode = key !== 'js';

        let env = `${getBin('cross-env')} ESLINT_USE_FLAT_CONFIG=false `;
        let ext = '.js,.jsx' + (tsMode ? ',.ts,.tsx' : '') + ',.md';
        let target = `${dirs.join(' ') || '.'} --ext ${ext}`;

        cmd = `${env}${getBin('eslint')} -c ${configPath} ${target} --no-eslintrc` +
            (config.fix ? ' --fix' : '');
    }

    if (config.debug) {
        createDebugEslintConfig(key, configPath);

        console.log();
        console.log('Command:');
        console.log(cmd);
    }

    if (tsMode) {
        createTempTsConfig(dirs, config);
        await exec(cmd);
    }
    else await exec(cmd);
}

function stop(ok, config) {
    if (!ok && config.explicitExitCode)
        process.exit(1);
}

(async () => {
    let config = getConfig();

    if (config.debug) {
        console.log();
        console.log('Config:');
        console.log(JSON.stringify(config, null, 2));

        console.log();
        console.log('Working directory:');
        console.log(cwd);
    }

    if (args.includes('--help')) {
        showGuide();

        return stop(true, config);
    }

    let selectedConfigKeys = Object.keys(config).filter(key => configKeys.includes(key));

    if (selectedConfigKeys.length === 0) {
        console.error(
            'Specify a config key or add a config file \'.lintrc(.js|.json)\' ' +
            'to the project root.',
        );
        console.log('Structure of the config file:');
        console.log('{\n  <config_key>: [...<project_directories>]\n}');

        showGuide();

        return stop(false, config);
    }

    try {
        console.log();

        if (config.sequential || config.parallel === false) {
            for (let key of selectedConfigKeys) {
                console.log(`lint ${key}`);
                await execConfigEntry(key, config[key], config);
            }
        }
        else {
            console.log(`lint ${selectedConfigKeys.join(', ')}`);
            await Promise.all(
                selectedConfigKeys.map(key => execConfigEntry(key, config[key], config)),
            );
        }

        console.log('\n\x1b[42m\x1b[37m\xa0PASSED\xa0\x1b[0m');
    }
    catch (error) {
        console.log('\n\x1b[41m\x1b[37m\xa0FAILED\xa0\x1b[0m');

        if (config.debug && error?.cmd)
            console.log(error.cmd);

        if (error?.stdout)
            console.log(error.stdout);

        if (!error?.stdout || config.debug)
            console.log(error?.stderr ?? error);

        stop(false, config);
    }
    finally {
        removeTempTsConfig(config);
    }
})();
