var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var source = require('vinyl-source-stream');


gulp.task('build', function () {
    return browserify({
            entries: ['./src/index.js']
        })
        .transform("babelify", {
            presets: ["env", "flow"],
        })
        .bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('build'));

})

gulp.task('aaa', function(){
    return gulp.src('src/FunctionVisualize.js')
        .pipe(babel())
        .pipe(gulp.dest('build'))
})

gulp.task('dist', function () {
    return gulp.src('build/index.js')
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
})

gulp.task('watch', function () {
    runSequence('build', 'dist');
    gulp.watch('src/**/*.js', function () {
        runSequence('build', 'dist');
    });
})
