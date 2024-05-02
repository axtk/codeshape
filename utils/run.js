#!/usr/bin/env node
/* eslint-disable no-console */

const {existsSync, readdirSync, removeFileSync, writeFileSync} = require('fs');
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
    console.log('\nOptions:');
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
        let ext = '{js,jsx,ts,tsx,md}';

        let tempTsConfig = {
            extends: './tsconfig.json',
            includes: dirs.length ? dirs.map(dir => `${dir}/**/*.${ext}`) : [`*.${ext}`],
            exludes: tsConfig.excludes ?? [],
        };

        if (config.debug) {
            console.log('Temp tsconfig:');
            console.log(tempTsConfigFilePath);
            console.log(JSON.stringify(tempTsConfig, null, 2));
            console.log();
        }

        writeFileSync(tempTsConfigFilePath, JSON.stringify(tempTsConfig, null, 2));

        if (config.debug) {
            console.log('Created temp tsconfig:');
            console.log(tempTsConfigFilePath);
            console.log();
        }
    }
    catch (error) {
        if (config.debug) {
            console.log('Failed to create temp tsconfig');
            console.log(error);
            console.log();
        }
    }
}

function removeTempTsConfig(config) {
    try {
        let tempTsConfigFilePath = join(cwd, tempTsConfigFileName);

        removeFileSync(tempTsConfigFilePath);

        if (config.debug) {
            console.log('Removed temp tsconfig:');
            console.log(tempTsConfigFilePath);
            console.log();
        }
    }
    catch (error) {
        if (config.debug) {
            console.log('Failed to remove temp tsconfig');
            console.log(error);
            console.log();
        }
    }
}

async function execConfigEntry(key, dirs, config) {
    let configPath = join(__dirname, `../configs/${key}.js`);
    let cmd, tsMode = false;

    if (stylelintConfigKeys.includes(key)) {
        let root = dirs.length > 1 ? `(${dirs.join('|')})` : dirs.join() || '.';
        let target = `"${root}/**/*.${key === 'scss' ? '(css|scss)' : 'css'}"`;

        cmd = `npx stylelint --config ${configPath} ${target}${config.fix ? ' --fix' : ''}`;
    }
    else {
        tsMode = key !== 'js';

        let env = 'cross-env ESLINT_USE_FLAT_CONFIG=false ';
        let ext = '.js,.jsx' + (tsMode ? ',.ts,.tsx' : '') + ',.md';

        cmd = `${env}npx eslint -c ${configPath} ${dirs.join(' ') || '.'} --ext ${ext}` +
            ' --no-eslintrc' +
            (config.fix ? ' --fix' : '');
    }

    if (config.debug)
        console.log(cmd);

    if (tsMode) {
        createTempTsConfig(dirs, config);
        await exec(cmd);
        removeTempTsConfig(config);
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
        console.log('Config:');
        console.log(JSON.stringify(config, null, 2));
        console.log();

        console.log('Working directory:');
        console.log(cwd);
        console.log();
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
})();
