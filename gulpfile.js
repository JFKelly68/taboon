var gulp = require('gulp'),
    del = require('del'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
    copy = require('gulp-copy'),
    hb = require('gulp-hb'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    ext = require('gulp-extname'),
    rename = require('gulp-rename'),
    srcmaps = require('gulp-sourcemaps'),
    merge = require('merge-stream');

var config = {
  source: 'src/',
  build: 'build/',
  pages: {
    popup: '',
    options: 'options/'
  },
  partials: 'hb/partials/',
  data: 'hb/data/',
  helpers: 'hb/helpers/',
  sass: 'assets/styles/**/',
  js: '**/',
  manifest: 'manifest.json'
}

gulp.task('wipe', function(cb) {
  return del([config.build + '**/*', '!' + config.build])
            .then(function(paths) {
              console.log('** Deleted all files and folders **')
            });
});

gulp.task('html', function() {
  var deletedFiles = clean('html');

  return deletedFiles
          .then(function(paths) {
            if(!!paths.length) console.log('Deleted:\n\t', paths.join('\n\t '));
          })
          .then(function(paths) {
            var destinations = ['popup', 'options'];

            var tasks = destinations.map(function(location, idx) {

              return gulp.src(config.source + config.pages[location] + '*.hbs')
                        .pipe(hb({
                              partials: config.source + config.partials + '*.hbs',
                              helpers: config.source + config.helpers + '*.js',
                              data: config.source + config.data + '*.json'
                            })
                        )
                        .pipe(rename(function(path) {
                            path.extname = '.html';
                          })
                        )
                        .pipe(gulp.dest(config.build + config.pages[location]));
            });

            return merge(tasks);
          });
});

gulp.task('sass', function() {
  var deletedFiles = clean('sass', '{scss,css}');

  return deletedFiles
          .then(function(paths) {
            if(!!paths.length) console.log('Deleted:\n\t', paths.join('\n\t '));
          })
          .then(function() {
            return gulp.src('src/' + config.sass + '*.scss')
                      .pipe(plumber())
                      .pipe(sass().on('error', sass.logError))
                      .pipe(gulp.dest(config.build + '/assets/styles/'));
          });
});

gulp.task('sass:dist', function() {
  var deletedFiles = clean('sass', '{scss,css}');

  return deletedFiles
          .then(function(paths) {
            if(!!paths.length) console.log('Deleted:\n\t', paths.join('\n\t '));
          })
          .then(function() {
            return gulp.src('src/' + config.sass + '*.scss')
                      .pipe(plumber())
                      .pipe(srcmaps.init())
                      .pipe(sass({
                          outputStyle: 'compressed'
                        }).on('error', sass.logError))
                      .pipe(srcmaps.write('/maps'))
                      .pipe(gulp.dest(config.build  + '/assets/styles/'));
          });
});

gulp.task('js', function() {
  var deletedFiles = clean('js');

  return deletedFiles
          .then(function(paths) {
            if(!!paths.length) console.log('Deleted:\n\t', paths.join('\n\t '));
          })
          .then(function() {
            return gulp.src('src/' + config.js + '*.js')
                    .pipe(plumber())
                    .pipe(babel({
                      presets: ['es2015']
                    }))
                    .pipe(gulp.dest(config.build));
          });
});

gulp.task('js:dist', function() {
  var deletedFiles = clean('js');

  return deletedFiles
          .then(function(paths) {
            if(!!paths.length) console.log('Deleted:\n\t', paths.join('\n\t '));
          })
          .then(function() {
            return gulp.src('src/' + config.js + '*.js')
                    .pipe(plumber())
                    .pipe(srcmaps.init())
                    .pipe(babel({
                      presets: ['es2015']
                    }))
                    .pipe(uglify())
                    .pipe(srcmaps.write('/maps'))
                    .pipe(rename(function(path) {
                        path.extname = '.min.js';
                      })
                    )
                    .pipe(gulp.dest(config.build));
          });
});

gulp.task('watch', function() {
  gulp.watch([
    config.source + config.templates + '*.hbs',
    config.source + config.data + '*.json',
    config.source + config.helpers + '*.js'
  ], ['html']);
  gulp.watch([ config.source + config.js + '*.js' ], ['js']);
  gulp.watch([ config.source + config.sass + '*.scss'], ['sass']);
  gulp.watch([ config.source + config.manifest ], ['manifest']);
});

gulp.task('x', ['wipe']);

gulp.task('dev', ['html', 'js', 'sass', 'watch']);

gulp.task('default', ['html', 'js:dist', 'sass:dist'])


function clean(filetype, ext) {
  if(!!ext) {
    if(typeof ext !== 'string') return handleError('Second argument must be string or extension glob pattern!', 'TypeError');
    ext = ('*.' + ext);
  } else {
    ext = '*.' + filetype;
  }

  return del([config.build + config[filetype] + ext])
          .then(function(paths) {
            return !!paths.length ? paths : [];
          });
}

function handleError(msg, type) {
  var e = new Error(msg);
  if(!!type && typeof type == 'string' && !!type.length) e.name = type;

  throw e;

}
