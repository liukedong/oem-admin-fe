var grunt = require('grunt');

var lrSnippet = require('connect-livereload')();

function mountFolder(connect, dir) {
    return connect.static(require('path').resolve(dir));
}

function requireUncached(module) {
    try {
        delete require.cache[require.resolve(module)]
    } catch (e) {
        console.log(e);
    }
    return require(module)
}
var _ = grunt.util._,
    fs = require('fs');

var pathConfig = {
    app: 'app',
    dist: 'dist',
    tmp: '.tmp',
    test: 'test',
    sass: 'app/styles',
    css: 'app/styles',
    js: 'app/scripts'
};
var connectOpt = {
    options: {
        port: 8000,
        hostname: '*'
    },
    server: {
        options: {
            livereload: 35722,
            middleware: function(connect) {
                return [
                    function injectAPIHost(req, res, next) {
                        var apiPath = '/scripts/index.js';
                        if (req.url === apiPath) {
                            require('fs').readFile('app' + apiPath, 'utf8', function(err, data) {
                                res.end(data.replace("window._ServerUrl = ''", "window._ServerUrl = 'http://test.wandoujia.com'"));
                            });
                        } else {
                            next();
                        }
                    },
                    lrSnippet,
                    require('connect-modrewrite')([]),
                    // mountFolder(connect, pathConfig.tmp),
                    mountFolder(connect, pathConfig.app)
                ];
            },
            open: true,
            useAvailablePort: true
        }
    }
};

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var configOpts = {
        paths: pathConfig,
        clean: {
            dist: ['<%= paths.tmp %>', '<%= paths.dist %>'],
            server: '<%= paths.tmp %>'
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= paths.app %>',
                    dest: '<%= paths.dist %>',
                    src: [
                        '**/*'
                    ]
                }]
            },
            index: {
                files: {
                    'dist/index.html': 'app/index.html'
                }
            },
            static: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= paths.app %>',
                    dest: '<%= paths.dist %>/partner',
                    src: [
                        'font/**/*', 'images/**/*', 'assets/**/*', 'vendors/**/*'
                    ]
                }]
            },
            font: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= paths.app %>',
                    dest: '<%= paths.dist %>/partner/fonts',
                    src: ['components/font-awesome/fonts/**/*']
                }]
            }
        },
        uglify: {
            options: {
                preserveComments: 'some'
            }
        },

        useminPrepare: {
            html: ['dist/index.html'],
            options: {
                dest: 'dist',
                root: 'app'
            }
        },
        usemin: {
            html: ['dist/index.html'],
            css: ['.tmp/styles/**/*.css'],
            options: {
                dirs: ['dist'],
                assetsDirs: ['dist']
            }
        },
        htmlmin: {
            options: {
                collapseWhitespace: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.html'],
                    dest: 'dist'
                }]
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            dist: {
                files: [{
                        expand: true,
                        src: ['.tmp/concat/partner/scripts/app.js']
                }]
            }
        },
        filerev: {
            assets: {
                src: [
                    '<%= paths.dist %>/**/*',
                    '!<%= paths.dist %>/index.html'
                ],
                filter: 'isFile'
            }
        },
        requirejs: {
            options: {
                appDir: '<%= paths.app %>/scripts',
                baseUrl: './',
                dir: '<%= paths.tmp %>/scripts',
                optimize: 'none'
            },
            dist: {
                options: {
                    modules: [{
                        name: 'index'
                    }],
                    almond: true,
                    replaceRequireScript: [{
                        files: ['dist/index.html'],
                        module: 'index'
                    }]
                }
            }
        },
        connect: connectOpt,

        watch: {
            compass: {
                files: ['<%= paths.app %>/styles/**/*'],
                tasks: ['compass:dev']
            }
        },
        compass: {
            options: {
                importPath: '<%= paths.app %>/components',
                sassDir: '<%= paths.sass %>',
                cssDir: '<%= paths.css %>',
                imagesDir: '<%= paths.app %>/images',
                generatedImagesDir: '<%= paths.tmp %>/images',
                httpImagesPath: '../images',
                httpGeneratedImagesPath: '../images',
            },
            dev: {
                options: {
                    assetCacheBuster: true
                }
            },
            dist: {
                options: {
                    assetCacheBuster: false
                }
            }
        },

        concurrent: {
            server: {
                tasks: ['clean:server', 'compass:server'],
                options: {
                    logConcurrentOutput: true
                }
            },
            dist: {
                tasks: ['copy:compass', 'compass:dist'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            test: ['<%= paths.js %>/**/*.js', '!<%= paths.js %>/vendor/**/*']
        },
        removelogging: {
            dist: {
                src: '.tmp/concat/scripts/**/*.js'
            }
        },

        ngtemplates: {
            app: {
                src: 'app/templates/**/*.html',
                dest: 'app/scripts/templates.js',
                options: {
                    bootstrap: function(module, script) {
                        return "(function() { angular.module('oemApp.templates', []).run(['$templateCache'," + "function($templateCache) {" + script + "}]);})();";
                    },
                    url: function(url) {
                        return url.replace(/^app\//, '');
                    }
                }
            }
        }
    };

    grunt.initConfig(configOpts);

    grunt.registerTask('serve', [
        'compass:dev',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'compass:dist',
        'copy:index',
        'ngtemplates',
        'requirejs',
        'useminPrepare',
        'concat',
        'removelogging',
        'ngAnnotate',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'copy:static',
        'copy:font'
    ]);

    grunt.registerTask('build:staging', [
        'build'
    ]);

    grunt.registerTask('build:production', [
        'build'
        // add aws_s3 upload
    ]);
};