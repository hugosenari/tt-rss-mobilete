var
LIVERELOAD_PORT = 35729,
    lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    }),
    mountFolder = function(connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        connect: {
            options: {
                port: 1881,
                hostname: '127.0.0.1',
                open: false
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, 'output/www')
                        ];
                    }
                }
            }

        },
        uglify: {
          my_target: {
            files: [{
                expand: true,
                src: '**/*.js',
                dest: 'output/uglify',
                cwd: 'www'
            }]
          }
        },
        cssmin: {
          options: {
            shorthandCompacting: false,
            roundingPrecision: -1
          },
          target: {
            files: {
              'output/uglify/styles/app.css': ['www/styles/app.css'],
              
            }
          }
        },
        htmlmin: {
          dist: {
            options: {                                 // Target options
              removeComments: true,
              collapseWhitespace: true
            },
            files: {
                'output/uglify/index.html': 'www/index.html',
                'output/www/categories.html': 'www/categories.html',
                'output/www/detail.html': 'www/detail.html',
                'output/www/items.html': 'www/items.html',
                'output/www/login.html': 'www/login.html',
                'output/www/menu.html': 'www/menu.html',
                'output/www/settings.html': 'www/settings.html'
            }
          }
        },
        embed: {
          options: {
            threshold: '1024KB'
          },
          bla: {
            files: {
                'output/www/index.html': 'output/uglify/index.html'
            }
          },
        },
        watch: {
            files: ['www/**/*.*'],
            options: {
                livereload: LIVERELOAD_PORT
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-embed');
    grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'embed']);
    grunt.registerTask('serve', ['default', 'connect', 'watch']);
}
