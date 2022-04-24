const gulp = require('gulp');
const less = require('gulp-less');
const del = require('del');
const rename = require('gulp-rename');
const cleancss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autopref = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const { reload } = require('browser-sync');
const browser = require('browser-sync').create();
const gulppug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const ts = require('gulp-typescript');


const paths = {
    styles : {
        src: ['src/styles/**/*.less', 'src/styles/**/*.scss', 'src/styles/**/*.sass'],
        dest: 'dist/css/'
    },
    scripts : {
        src: ['src/scripts/**/*.js', 'src/scripts/**/*.ts'],
        dest: 'dist/js/'
    },
    img : {
        src: 'src/img/**',
        dest: 'dist/img/'
    },
    html : {
        src: 'src/*.html',
        dest: 'dist/'
    },
    pug : {
        src: 'src/**/*.pug',
        dest: 'dist/'
    }
}

function clean() {
    return del(['dist/*', '!dist/img'])
}

function pug() {
    return gulp.src(paths.pug.src)
    .pipe(gulppug())
    .pipe(size())
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browser.stream())
}

function minify() {
    return gulp.src(paths.html.src)
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(size())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browser.stream())
}

function styles() {
    return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    // .pipe(less())
    .pipe(sass().on('error', sass.logError))
    .pipe(autopref({
        cascade: false
    }))
    .pipe(cleancss({
        level: 2
    }))
    .pipe(rename({
        basename: 'main',
        suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browser.stream())
}

function scripts() {
    return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    // .pipe(ts({
    //     noImplicitAny: true,
    //     outFile: 'main.min.js'
    // }))
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(size())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browser.stream())
}

function img() {
    return gulp.src(paths.img.src)
    .pipe(newer(paths.img.dest))
    .pipe(imagemin({
        progressive: true
    }))
    .pipe(size())
    .pipe(gulp.dest(paths.img.dest))
}


function watch() {
    browser.init({
        server: {
            baseDir: "./dist/"
        }
    })
    gulp.watch(paths.html.dest).on('change', browser.reload);
    gulp.watch(paths.html.src, minify);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.img.src, img);
    
}


const build = gulp.series(clean, minify, gulp.parallel(styles, scripts, img), watch)

exports.clean = clean;
exports.styles = styles;
exports.img = img;
exports.minify = minify;
exports.pug = pug;
exports.watch = watch;
exports.scripts = scripts;
exports.build = build;
exports.default = build;