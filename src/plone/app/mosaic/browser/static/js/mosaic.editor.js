/**
 * This plugin is used to set an element to be editable.
 *
 * @author Rob Gietema
 * @version 0.1
 * @licstart  The following is the entire license notice for the JavaScript
 *            code in this page.
 *
 * Copyright (C) 2011 Plone Foundation
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @licend  The above is the entire license notice for the JavaScript code in
 *          this page.
 */

/*global jQuery: false, window: false */
/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true,
eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true,
immed: true, strict: true, maxlen: 80, maxerr: 9999 */

define([
    'jquery',
    'tinymce',
    'mockup-patterns-tinymce'
], function($, tinymce, TinyMCE) {
    'use strict';

    // Define mosaic namespace if it doesn't exist
    if (typeof($.mosaic) === "undefined") {
        $.mosaic = {};
    }

    // Define the editor namespace
    $.mosaic.editor = {
    };

    /**
    * Create a new instance of the mosaic editor.
    *
    * @constructor
    * @id jQuery.fn.mosaicEditor
    * @return {Object} Returns a new mosaic editor object.
    */
    $.fn.mosaicEditor = function () {
        var obj, pattern;

        // Get element
        obj = $(this);

        // Remove existing pattern
        if (obj.data("pattern-tinymce")) {
            obj.data("pattern-tinymce").destroy();
            obj.removeData("pattern-tinymce");
        }

        // Generate random id to make sure TinyMCE is unique
        var random_id = 1 + Math.floor(100000 * Math.random());
        while ($("#mosaic-rich-text-init-" + random_id,
               $.mosaic.document).length > 0) {
            random_id = 1 + Math.floor(100000 * Math.random());
        }
        obj.attr('id', 'mosaic-rich-text-init-' + random_id);
        obj.siblings('.mosaic-rich-text-toolbar').remove();
        obj.before($('<div class="mosaic-rich-text-toolbar"></div>')
            .attr('id', obj.attr('id') + '-panel'));

        // Build toolbar
        var tiletype, classes, classname, actions, group, x, y, toolbar;

        // Get tiletype
        tiletype = "";
        classes = obj.parents('.mosaic-tile').first().attr('class').split(" ");
        $(classes).each(function () {
            classname = this.match(/^mosaic-(.*)-tile$/);
            if (classname !== null) {
                if ((classname[1] !== 'selected') &&
                    (classname[1] !== 'new') &&
                    (classname[1] !== 'read-only') &&
                    (classname[1] !== 'helper') &&
                    (classname[1] !== 'original')) {
                    tiletype = classname[1];
                }
            }
        });

        // Get actions
        actions = $.mosaic.options.default_available_actions;
        for (x = 0; x < $.mosaic.options.tiles.length; x += 1) {
            group = $.mosaic.options.tiles[x];
            for (y = 0; y < group.tiles.length; y += 1) {
                if (group.tiles[y].name === tiletype) {
                    actions = actions
                        .concat(group.tiles[y].available_actions);
                }
            }
        }

        // Build toolbar
        toolbar = [];
        for (x = 0; x < $.mosaic.options.tinymce_toolbar.length; x += 1) {
            group = $.mosaic.options.tinymce_toolbar[x];
            for (y = 0; y < group.actions.length; y += 1) {
                if ($.inArray(group.actions[y].name, actions) > -1) {
                    toolbar.push(group.actions[y].name);
                }
            }
            if (toolbar.length && toolbar[toolbar.length - 1] != '|') {
                toolbar.push('|');
            }
        }
        if (toolbar.length && toolbar[toolbar.length - 1] == '|') {
            toolbar.pop();
        }

        var placeholder = function() {
            if (obj.text().replace(/^\s+|\s+$/g, '').length === 0) {
                obj.addClass('mosaic-tile-content-empty');
            } else {
                obj.removeClass('mosaic-tile-content-empty');
            }
        };

        // XXX: Required to override global settings in Plone 5
        $("body").removeAttr("data-pat-tinymce");

        // Init rich editor
        pattern = TinyMCE.init(obj, $.extend(
            true, {}, $.mosaic.options.tinymce, { tiny: {
            selector: "#" + "mosaic-rich-text-init-" + random_id,
            theme: "modern",
            inline: true,
            toolbar: toolbar.join(' ') || false,
            statusbar: false,
            menubar: false,
            fixed_toolbar_container: '#' + obj.attr('id') + '-panel',
            add_unload_trigger: false,
            setup: function(editor) {
                editor.on('focus', function(e) {
                    if (e.target.id) {
                        $('#' + e.target.id)
                            .parents('.mosaic-tile').first()
                            .mosaicSelectTile();
                    }
                });
                editor.on('change', placeholder);
                placeholder();
            }
        }}));

        // Set editor class
        obj.addClass('mosaic-rich-text');
    };

    /**
     * Exec a command on the editor
     *
     * @id jQuery.mosaic.execCommand
     * @param {String} command Command to execute
     * @param {String} ui UI to use
     * @param {String} value Vale of the command
     */
    $.mosaic.execCommand = function (command, ui, value) {

        // Exec command
        if (tinymce.activeEditor) {
            tinymce.activeEditor.execCommand(command, ui, value);
        }
    };

    /**
     * Apply formatting to the current selection
     *
     * @id jQuery.mosaic.editor.applyFormat
     * @param {String} format Name of the registered format to apply
     */
    $.mosaic.editor.applyFormat = function (format) {

        // Apply format
        if (tinymce.activeEditor) {
            tinyMCE.activeEditor.formatter.apply(format);
        }
    };

    /**
     * Register format
     *
     * @id jQuery.mosaic.editor.registerFormat
     * @param {String} name Name of the registered format to apply
     * @param {Object} format Formatting object
     */
    $.mosaic.editor.registerFormat = function (name, format) {

        // Apply format
        if (tinymce.activeEditor) {
            tinymce.activeEditor.formatter.register(name, format);
        }
    };
});
