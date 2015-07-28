/*!
 * jQuery TS3 Viewer v1.0.0
 * https://www.planetteamspeak.com
 *
 * Copyright (c) Planet TeamSpeak. All rights reserved.
 * Released under the MIT license.
 */

(function($)
{
  /**
   * Constructor
   * 
   * @param   array options
   * @returns void
   */
  $.fn.tsviewer = function(options)
  {
    $.fn.tsviewer.element = this;
    $.fn.tsviewer.options = $.extend({}, $.fn.tsviewer.options, options);
    
    $.fn.tsviewer.init();
    $.fn.tsviewer.hook();
  };

  /**
   * Settings
   */
  $.fn.tsviewer.element = null;
  $.fn.tsviewer.options = {
    // connection
    host: null,
    port: null,
    // data sources
    iconUrl: 'https://api.planetteamspeak.com/servericon/$host:$port/?id=$icon&amp;img=1',
    dataUrl: 'https://api.planetteamspeak.com/servernodes/$host:$port/',
    // tooltip settings
    serverTip:  '',
    channelTip: '',
    clientTip:  '',
    // callback settings
    onNode:  function() {},
    onReady: function() {},
    onError: function() {}
  };

  /**
   * Initializes the plugin
   */
  $.fn.tsviewer.init = function()
  {
    // generate base element
    $.fn.tsviewer.element.html('<ul id="tsv-container-ts3" class="tsv-container"></ul>');
    
    // prepare data sources based on server addr/port
    $.fn.tsviewer.options.iconUrl = $.fn.tsviewer.options.iconUrl.replace('$host', $.fn.tsviewer.options.host).replace('$port', $.fn.tsviewer.options.port);
    $.fn.tsviewer.options.dataUrl = $.fn.tsviewer.options.dataUrl.replace('$host', $.fn.tsviewer.options.host).replace('$port', $.fn.tsviewer.options.port);
    
    // refresh
    $.fn.tsviewer.refresh(true);
  };
  
  /**
   * Requests data and starts rendering the nodes
   */
  $.fn.tsviewer.refresh = function(loader)
  {
    // fire up the ajax request
    var req = $.ajax($.fn.tsviewer.options.dataUrl);
    
    // animation
    if(loader === true)
    {
      $('#tsv-container-ts3').html('<li id="tsv-node-loader" class="tsv-node loader"><div class="tsv-icon tsv-loader"></div><span class="tsv-name">Loading ...</span></li>');
    }
    
    // ajax request is done
    req.done(function(json, status, request)
    {
      if(json.status !== 'success' || !$.isArray(json.result.data))
      {
        return $.fn.tsviewer.error(request, json.result.message);
      }
      
      $('#tsv-container-ts3').html('');
      
      for(var i = 0; i < json.result.data.length; i++)
      {
        $.fn.tsviewer.render(json.result.data[i], i);
      }
      
      $.fn.tsviewer.options.onReady.call(this, json.result.data, i);
    });
    
    // ajax request failed
    req.fail(function(request, status, error)
    {
      return $.fn.tsviewer.error(request, 'failed to retrieve tsviewer data');
    });
  };
  
  /**
   * Expand all nodes in the tree
   */
  $.fn.tsviewer.expand = function()
  {
    $.fn.tsviewer.element.find('.tsv-sibling.collapsed').each(function() {
      $(this).parents('.tsv-wrapper').siblings('ul').show();
      $(this).toggleClass('expanded');
      $(this).toggleClass('collapsed');
    });
  };
  
  /**
   * Collapse all nodes in the tree
   */
  $.fn.tsviewer.collapse = function()
  {
    $.fn.tsviewer.element.find('.tsv-sibling.expanded').each(function() {
      $(this).parents('.tsv-wrapper').siblings('ul').hide();
      $(this).toggleClass('expanded');
      $(this).toggleClass('collapsed');
    });
  };
  
  /**
   * Expand/Collapse a specific node in the tree
   */
  $.fn.tsviewer.hook = function()
  {
    $.fn.tsviewer.element.on('click', '.tsv-sibling.expanded, .tsv-sibling.collapsed', function()
    {
      $(this).parents('.tsv-wrapper').siblings('ul').toggle();
      $(this).toggleClass('expanded');
      $(this).toggleClass('collapsed');
    });
  };

  /**
   * Renders a single node in the tree
   */
  $.fn.tsviewer.render = function(node, num)
  {
    // fix node class for spacers
    if(node.class === 'channel' && node.props.flags & 0x80)
    {
      node.class = 'spacer ' + node.props.spacer.replace('custom', '');

      if(node.props.spacer.substr(0, 6) !== 'custom')
      {
        node.name = '';
      }
      else if(node.name.length && node.props.spacer.substr(node.props.spacer.length-6) === 'repeat')
      {
        while(node.name.length < 256)
        {
          node.name += node.name;
        }
      }
    }

    // generate node object
    var object = $('<li id="tsv-node-' + node.ident + '" class="tsv-node ' + node.class + ' tsv-' + (num%2 ? 'row2' : 'row1') + '" data-id="' + node.props.id + '"></li>');
    
    // append node to parent container
    $('#tsv-container-' + node.parent).append(object);
    
    // generate block elements
    var wrapper = $('<div class="tsv-wrapper"></div>');
    var nodebox = $('<div class="tsv-' + node.class + '"></div>');
    var infobox = $('<div class="tsv-infos"></div>');
    var iconbox = $('<div class="tsv-icons"></div>');
    var tooltip = '';

    // assign wrapper
    object.append(wrapper);
    object.append('<div class="tsv-clear"></div>');

    // assign elements
    wrapper.append(nodebox);
    nodebox.append(infobox);
    nodebox.append(iconbox);
    
    // render siblings
    for(var i = 0; i < node.siblings.length; i++)
    {
      infobox.append('<div class="tsv-sibling ' + (node.siblings[i] ? 'tsv-sibling-line' : 'tsv-sibling-blank') + '"></div>');
    }
    
    // line endings
    if(node.level > 1)
    {
      infobox.append('<div class="tsv-sibling ' + (node.last ? 'tsv-sibling-end' : 'tsv-sibling-mid') + (node.children > 0 ? ' expanded' : '') + '"></div>');
    }

    // render node icon
    if(node.class.substr(0, 6) !== 'spacer')
    {
      if(node.class === 'channel' && node.props.flags & 0x40)
      {
        node.image += '-subscribed';
      }

      infobox.append('<div class="tsv-icon tsv-' + node.image + '"></div>');
    }

    // do node specifics
    if(node.class === 'server')
    {
      tooltip += $.fn.tsviewer.options.serverTip;
    }
    else if(node.class === 'channel')
    {
      if(node.props.flags & 0x01) iconbox.append('<div class="tsv-icon tsv-channel-flag-default" title="Default Channel"></div>');
      if(node.props.flags & 0x02) iconbox.append('<div class="tsv-icon tsv-channel-flag-password" title="Password-protected"></div>');
      if(node.props.flags & 0x10) iconbox.append('<div class="tsv-icon tsv-channel-flag-music" title="Music Codec"></div>');
      if(node.props.flags & 0x20) iconbox.append('<div class="tsv-icon tsv-channel-flag-moderated" title="Moderated"></div>');

      node.props.codec = $.fn.tsviewer.codec(node.props.codec);

      tooltip += $.fn.tsviewer.options.channelTip;
    }
    else if(node.class === 'client')
    {
      if(node.props.flags & 0x08) iconbox.append('<div class="tsv-icon tsv-client-priority" title="Priority Speaker"></div>');
      if(node.props.flags & 0x04) iconbox.append('<div class="tsv-icon tsv-client-cc" title="Channel Commander"></div>');
      if(node.props.flags & 0x10) iconbox.append('<div class="tsv-icon tsv-client-talker" title="Talk Power granted"></div>');
      if(node.props.flags & 0x20) iconbox.append('<div class="tsv-icon tsv-client-mic-muted" title="Insufficient Talk Power"></div>');

      for(var i = 0; i < node.props.memberof.length; i++)
      {
        iconbox.append($.fn.tsviewer.icon(node.props.memberof[i].icon, $('<div />').text(node.props.memberof[i].name).html() + ' [' + (node.props.memberof[i].flags & 32 ? 'Server' : 'Channel') + ' Group]'));
      }

      tooltip += $.fn.tsviewer.options.clientTip;
    }
    
    // prepare tooltip
    if(tooltip.length)
    {
      for(var prop in node.props)
      {
        tooltip = tooltip.replace('$' + prop, node.props[prop]);
      }
    }
    
    // assign information to block elements
    iconbox.append($.fn.tsviewer.icon(node.props.icon, node.class.charAt(0).toUpperCase() + node.class.slice(1) + ' Icon'));
    infobox.append('<span class="tsv-name"' + (tooltip.length ? ' title="' + tooltip + '"' : '') + '>' + (node.name ? $('<div />').text(node.name).html() : '&nbsp;') + '</span>');

    // set nodebox width
    $.fn.tsviewer.width(nodebox, iconbox);
    
    // callback
    $.fn.tsviewer.options.onNode.call(this, object, node);
    
    // prepare children
    if(node.children > 0)
    {
      object.append('<ul id="tsv-container-' + node.ident + '" class="tsv-container"></ul>');
    }
  };
  
  /**
   * Returns the base URL of the current script
   */
  $.fn.tsviewer.base = function()
  {};
  
  /**
   * Returns the HTML to render an icon
   */
  $.fn.tsviewer.icon = function(id, title)
  {
    if(id > 0)
    {
      if(id < 1000)
      {
        return '<div class="tsv-icon tsv-group-' + id + '" title="' + title + '"></div>';
      }
      else
      {
        return '<div class="tsv-icon" style="background: url(\'' + $.fn.tsviewer.options.iconUrl.replace('$icon', id) + '\') 0 0/contain no-repeat" title="' + title + '"></div>';
      }
    }
    
    return '';
  };
  
  /**
   * Returns the codec name based on an ID
   */
  $.fn.tsviewer.codec = function(codec)
  {
    if(codec === 0x00) return 'Speex Narrowband';
    if(codec === 0x01) return 'Speex Wideband';
    if(codec === 0x02) return 'Speex Ultra-Wideband';
    if(codec === 0x03) return 'CELT Mono';
    if(codec === 0x04) return 'Opus Voice';
    if(codec === 0x05) return 'Opus Music';
    
    return codec;
  };
  
  /**
   * Calculates and sets width for the icon sidebar
   */
  $.fn.tsviewer.width = function(nodebox, iconbox)
  {
    var width = iconbox.width();
    
    nodebox.css({ marginRight: width });
    iconbox.css({ marginRight: -width, width: width });
  };
  
  /**
   * Sets an error message
   */
  $.fn.tsviewer.error = function(request, error)
  {
    $.fn.tsviewer.options.onError.call(this, error);
    
    $('#tsv-container-ts3').html('<li id="tsv-node-error" class="tsv-node error"><div class="tsv-icon tsv-error" title="ERROR, ' + error.toLowerCase() + '"></div><span class="tsv-name">' + $.fn.tsviewer.options.host + ':' + $.fn.tsviewer.options.port + '</span></li>');
  };
  
  /**
   * Shortcut method to refresh the tree
   */
  $.fn.tsviewerRefresh = function(loader)
  {
    if($.fn.tsviewer.element)
    {
      $.fn.tsviewer.refresh(loader);
    }
  };
  
  /**
   * Shortcut method to expand the tree
   */
  $.fn.tsviewerExpand = function()
  {
    if($.fn.tsviewer.element)
    {
      $.fn.tsviewer.expand();
    }
  };
  
  /**
   * Shortcut method to collapse the tree
   */
  $.fn.tsviewerCollapse = function()
  {
    if($.fn.tsviewer.element)
    {
      $.fn.tsviewer.collapse();
    }
  };
}(jQuery));
