var gulp      = require('gulp');
var config    = require('../../../gulp-config.json');
var extension = require('../../../package.json');

// Dependencies
var beep        = require('beepbeep')
var browserSync = require('browser-sync');
var concat      = require('gulp-concat');
var del         = require('del');
var gutil       = require('gulp-util');
var sass        = require('gulp-sass');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');

var modName   = "redheremap";
var modFolder = "mod_" + modName;
var modBase   = "site";

var baseTask  = 'modules.frontend.' + modName;
var extPath   = '../extensions/modules/' + modBase + '/' + modFolder;

var wwwPath = config.wwwDir + '/modules/' + modFolder;

var path = {
  JS: '../src/*.js',
  MINIFIED_OUT: 'redheremap.js',
  DEST_BUILD: extPath + '/assets',
};

// Clean
gulp.task('clean:' + baseTask,
    [
        'clean:' + baseTask + ':module'
    ],
    function() {
    });

// Clean: Module
gulp.task('clean:' + baseTask + ':module', function() {
    return del(wwwPath, {force: true});
});

// Copy: Module
gulp.task('copy:' + baseTask,
    [
        'clean:' + baseTask,
        "copy:" + baseTask + ":compress",
        'copy:' + baseTask + ':module'
    ]
);

// Copy: Module
gulp.task('copy:' + baseTask + ':module', ['clean:' + baseTask + ':module'], function() {
    return gulp.src([
        extPath + '/**'
    ])
        .pipe(gulp.dest(wwwPath));
});

// Copy: Media
gulp.task('copy:' + baseTask + ':media', ['clean:' + baseTask + ':media'], function() {
    return gulp.src([
        mediaPath + '/**'
    ])
        .pipe(gulp.dest(wwwMediaPath));
});

gulp.task('copy:' + baseTask + ':compress', function () {
    gulp.src(path.JS)
    .pipe(concat(path.MINIFIED_OUT))
    //.pipe(uglify(path.MINIFIED_OUT))
    .pipe(gulp.dest(path.DEST_BUILD));
});

// Watch
gulp.task('watch:' + baseTask,
    [
        'watch:' + baseTask + ':module'
    ],
    function() {
    });

// Watch: Module
gulp.task('watch:' + baseTask + ':module', function() {
    gulp.watch([
            extPath + '/**/*'
        ],
        ['copy:' + baseTask + ':module', browserSync.reload]);
});
