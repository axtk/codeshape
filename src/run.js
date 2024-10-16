#!/usr/bin/env node
/* eslint-disable no-console, max-lines */
const {access, readdir, rm, writeFile} = require('node:fs/promises');
const {join, resolve} = require('node:path');
const {exec} = require('node:child_process');
const {promisify} = require('node:util');

const execAsync = promisify(exec);

let ownRootDir = join(__dirname, '../');
let targetDir = process.cwd();
let args = process.argv.slice(2);

let tempTsConfigFileName = 'tsconfig.codeshape.json';
let tempFiles = [];

let defaultJSExcludes = [
    'dist/**/*.js',
    'assets/**/*.js',
    'res/**/*.js',
    '**/*.md/*.ts',
    '**/*.md/*.tsx',
];

let defaultCSSExcludes = [
    'dist/**/*.css',
    'assets/**/*.css',
    'res/**/*.css',
];

async function getNameList(dir) {
    try {
        let dirPath = join(ownRootDir, dir);

        return (await readdir(dirPath)).reduce((list, name) => {
            if (name.endsWith('.js'))
                list.push(name.slice(0, -3));

            return list;
        }, []);
    }
    catch {
        return [];
    }
}

let presetKeys = [];
let configKeys = [];

let stylelintConfigKeys = ['css'];

async function setup() {
    presetKeys = await getNameList('presets');
    configKeys = await getNameList('configs');
}

function showGuide() {
    console.log();
    console.log('Optional parameters:');
    // console.log('  <target directory path> (should be the first parameter, if provided)');
    console.log('  --<config_key> <dir1> <dir2> ...');
    console.log('  --<preset_key> (experimental, currently unused)');
    console.log('  --fix');
    console.log('  --debug');
    console.log('  --config <path> | -c <path>');
    console.log('  --ignore-config (ignore config file)');
    console.log('  --explicit-exit-code | -x (fail with exit code 1)');
    console.log('  --no-default-excludes (such as \'dist\', \'assets\', \'res\')');
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
                configPath = join(targetDir, args[i + 1]);
            else if (['fix', 'debug', 'sequential'].includes(key))
                argConfig[key] = true;
            else if (presetKeys.includes(key))
                configPath = join(ownRootDir, 'presets', `${key}.js`);
        }
        else if (arg.startsWith('-') && arg.length === 2) {
            let key = arg.slice(1);

            if (key === 'c' && args[i + 1])
                configPath = join(targetDir, args[i + 1]);
        }
        else if (i === 0)
            targetDir = resolve(arg);
        else if (configKey)
            argConfig[configKey].push(arg);
    }

    if (args.includes('--explicit-exit-code') || args.includes('-x'))
        argConfig.explicitExitCode = true;

    if (args.includes('--no-default-excludes'))
        argConfig.noDefaultExcludes = true;

    let fileConfig = {};

    try {
        if (configPath)
            fileConfig = require(configPath);
        else if (!args.includes('--ignore-config'))
            fileConfig = require(join(targetDir, './.lintrc'));
    }
    catch {}

    return {...fileConfig, ...argConfig};
}

function updateParserOptions(parserOptions) {
    if (!parserOptions?.project)
        return;

    if (typeof parserOptions.project === 'string')
        parserOptions.project = join(targetDir, parserOptions.project);

    if (Array.isArray(parserOptions.project)) {
        for (let i = 0; i < parserOptions.project.length; i++)
            parserOptions.project[i] = join(targetDir, parserOptions.project[i]);
    }

    return parserOptions;
}

async function createTempEslintConfig(key, configPath, config) {
    let path;

    try {
        if (config.debug) {
            console.log();
            console.log('Eslint config:');
            console.log(configPath);
        }

        if (configPath) {
            let eslintConfig = require(configPath);

            path = join(targetDir, `eslint.${key}.config.json`);
            tempFiles.push(path);

            updateParserOptions(eslintConfig?.parserOptions);

            if (eslintConfig.overrides) {
                for (let overrideConfig of eslintConfig.overrides)
                    updateParserOptions(overrideConfig?.parserOptions);
            }

            await writeFile(path, JSON.stringify(eslintConfig, null, 4));

            if (config.debug)
                console.log(`>> ${path}`);
        }
    }
    catch (error) {
        if (config.debug) {
            console.log();
            console.log(error);
        }
    }

    return path;
}

async function createTempTsConfig(dirs, config) {
    try {
        let tsConfig;

        try {
            tsConfig = require('./tsconfig.json');
        }
        catch {
            tsConfig = {};
        }

        let tempTsConfigFilePath = join(targetDir, tempTsConfigFileName);

        tempFiles.push(tempTsConfigFilePath);

        let codeExt = '{js,jsx,ts,tsx}';
        let mdExt = 'md/*.{js,jsx}';

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
            exludes: [
                ...tsConfig.excludes ?? [],
                ...config.noDefaultExcludes ? [] : defaultJSExcludes,
            ],
        };

        if (config.debug) {
            console.log();
            console.log('Temp tsconfig:');
            console.log(JSON.stringify(tempTsConfig, null, 2));
        }

        await writeFile(tempTsConfigFilePath, JSON.stringify(tempTsConfig, null, 4));

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

async function removeTempFiles(config) {
    try {
        for (let path of tempFiles) {
            try {
                await rm(path);

                if (config.debug) {
                    console.log();
                    console.log('Removed temp file:');
                    console.log(`<< ${path}`);
                }
            }
            catch {}
        }
    }
    catch (error) {
        if (config.debug) {
            console.log();
            console.log('Failed to remove temp files');
            console.log(error);
        }
    }
}

async function getBin(name) {
    let ownBin = join(ownRootDir, `node_modules/.bin/${name}`);

    try {
        await access(ownBin);

        return ownBin;
    }
    catch {
        let packageConfig = require(join(ownRootDir, 'package.json'));
        let version = packageConfig.dependencies[name];

        return `npx ${name}@${version}`;
    }
}

async function execConfigEntry(key, dirs, config) {
    let configPath = join(ownRootDir, 'configs', `${key}.js`);
    let tempConfigPath, cmd, tsMode = false;

    if (stylelintConfigKeys.includes(key)) {
        let root = dirs.length > 1 ? `(${dirs.join('|')})` : dirs.join();

        root = root ? `${targetDir}/${root}` : targetDir;

        let target = `"${root}/**/*.${key === 'scss' ? '(css|scss)' : 'css'}"`;

        cmd = `${await getBin('stylelint')} --config ${configPath} ${target}`;

        if (!config.noDefaultExcludes) {
            for (let exclude of defaultCSSExcludes)
                cmd += ` --ignore-pattern "${exclude}"`;
        }

        if (config.fix)
            cmd += ' --fix';
    }
    else {
        tsMode = key !== 'js';
        tempConfigPath = await createTempEslintConfig(key, configPath, config);

        let env = `${await getBin('cross-env')} ESLINT_USE_FLAT_CONFIG=false `;
        let ext = '.js,.jsx' + (tsMode ? ',.ts,.tsx' : '') + ',.md';
        let target = `${dirs.map(d => `${targetDir}/${d}`).join(' ') || targetDir} --ext ${ext}`;

        cmd = `${env}${await getBin('eslint')} -c ${tempConfigPath} ${target} --no-eslintrc`;

        if (!config.noDefaultExcludes) {
            for (let exclude of defaultJSExcludes)
                cmd += ` --ignore-pattern "${exclude}"`;
        }

        if (config.fix)
            cmd += ' --fix';
    }

    if (config.debug) {
        console.log();
        console.log('Command:');
        console.log(cmd);
    }

    if (tsMode) {
        await createTempTsConfig(dirs, config);
        await execAsync(cmd);
    }
    else await execAsync(cmd);
}

function stop(ok, config) {
    if (!ok && config.explicitExitCode)
        process.exit(1);
}

async function run() {
    await setup();

    let config = getConfig();

    if (config.debug) {
        console.log();
        console.log('Config:');
        console.log(JSON.stringify(config, null, 2));

        console.log();
        console.log('Own directory:');
        console.log(ownRootDir);

        console.log();
        console.log('Target directory:');
        console.log(targetDir);
    }

    if (args.includes('--help')) {
        showGuide();

        return stop(true, config);
    }

    let selectedConfigKeys = Object.keys(config)
        .filter(key => configKeys.includes(key));

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
                console.log(`Linting "${key}"`);
                await execConfigEntry(key, config[key], config);
            }
        }
        else {
            console.log(`Linting ${selectedConfigKeys.map(s => `"${s}"`).join(', ')}`);
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
        await removeTempFiles(config);
    }
}

(async () => {
    await run();
})();
