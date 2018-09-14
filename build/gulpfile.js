var gulp = require('gulp');

var extension = require('./package.json');
var config    = require('./gulp-config.json');

var requireDir = require('require-dir');
var zip        = require('gulp-zip');
var fs         = require('fs');
var xml2js     = require('xml2js');
var parser     = new xml2js.Parser();

var jgulp = requireDir('./node_modules/joomla-gulp', {recurse: true});
var dir = requireDir('./joomla-gulp-extensions', {recurse: true});

// Get console args
var argv       = require("yargs").argv;
var path       = require("path");

var rootPath = '../extensions';
var libraryName = 'red_xxx';
var packageName = 'red_xxx';

/**
 * Function for read list folder
 *
 * @param  string dir Path of folder
 *
 * @return array      Subfolder list.
 */
function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

/**
 * Get glob of an extension
 *
 * @param extensionType
 * @param group
 * @param extName
 * @returns {[*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*,*]}
 */
function getGlobExtensionPattern(extensionType, group, extName) {
    return [
        './' + extensionType + '/' + group + '/' + extName + '/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/composer.json',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/composer.lock',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/*.md',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/*.txt',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/*.TXT',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/*.pdf',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/LICENSE',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/CHANGES',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/README',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/VERSION',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/composer.json',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/.gitignore',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/docs',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/docs/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/tests',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/tests/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/unitTests',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/unitTests/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/.git',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/.git/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/examples',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/examples/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/build.xml',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/phpunit.xml',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/phpunit.xml.dist',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/**/phpcs.xml',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/mpdf/mpdf/ttfonts/!(DejaVu*.ttf)',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/setasign/fpdi',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/setasign/fpdi/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/tecnickcom/tcpdf/fonts/!(courier*.php|helvetica*.php|symbol*.php|times*.php|uni2cid_a*.php|zapfdingbats*.php)',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/tecnickcom/tcpdf/fonts/ae_fonts*/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/tecnickcom/tcpdf/fonts/dejavu-fonts-ttf*/**',
        '!./' + extensionType + '/' + group + '/' + extName + '/**/vendor/tecnickcom/tcpdf/fonts/freefont-*/**'
    ]
}


/**
 * Function for release module
 * @param group
 * @param name
 * @returns {*}
 */
function moduleRelease(group, name) {
    var fileName = name;
    var arraySrc = getGlobExtensionPattern('../extensions/modules/', group, name);
    var destDir = config.release_dir + '/modules/' + group;

    fs.readFile('../extensions/modules/' + group + '/' + name + '/' + name + '.xml', function(err, data) {
        if (data === undefined)
        {
            return false;
        }

        parser.parseString(data, function (err, result) {
            var version = result.extension.version[0];

            fileName += '-v' + version + '.zip';

            var count = 35 - name.length;
            var nameFormat = name;

            for (var i = 0; i < count; i++)
            {
                nameFormat += ' ';
            }

            count = 8 - version.length;

            for (i = 0; i < count; i++)
            {
                version += ' ';
            }

            return gulp.src(arraySrc).pipe(zip(fileName)).pipe(gulp.dest(destDir));
        });
    });
}

// Release: Modules
gulp.task('release', function(cb) {
    var basePath  = '../extensions/modules/';
    var modSource = argv.group ? argv.group : false;
    var modName   = argv.name ? argv.name : false;
    var modules   = [];

    // No group specific, release all of them.
    if (!modSource) {
        var groups = getFolders(basePath);

        for (var i = 0; i < groups.length; i++) {
            modules = getFolders(basePath + '/' + groups[i]);
            for (j = 0; j < modules.length; j++) {
                moduleRelease(groups[i], modules[j]);
            }
        }
    }
    else if (modSource && !modName) {
        try {
            fs.statSync('./modules/' + modSource);
        }
        catch (e) {
            console.error("Folder not exist: " + basePath + '/' + plgGroup);
            return;
        }

        modules = getFolders(basePath + '/' + modSource);

        for (i = 0; i < modules.length; i++) {
            moduleRelease(modSource, modules[i]);
        }
    }
    else
    {
        try {
            fs.statSync('./modules/' + modSource + '/' + modName);
        }
        catch (e) {
            console.error("Folder not exist: " + basePath + '/' + modSource + '/' + modName);
            return;
        }

        moduleRelease(modSource, modName);
    }
});