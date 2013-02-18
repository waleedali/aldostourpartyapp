var AppInited = false;
var App = {
   Config: {
      animSpeed: 300,
      splashScreenDuration: 0,
      pagesViaAjax: true
   },
   init: function() {      
      //tap event effects for links
      $("a:not(.tapInEffected)").addClass("tapInEffected").bind("touchstart mousedown", function() {
         $(this).addClass("hover");
      });
      $("a:not(.tapOutEffected)").addClass("tapOutEffected").bind("touchmove touchend mouseup", function() {
         $(this).removeClass("hover");
      });
      
      //hide back and home buttons on home page
      $(".home-trigger, .back-trigger").hide();
      
      $('.flexslider:not(.flexslidered)').addClass("flexslidered").flexslider({
         animation: "slide",
         controlNav: false,
         itemWidth: 200,
         animationLoop: false,
         start: function(slider) {
            $(window).resize(function() {
               slider.flexAnimate(0);
            });
         }
       });
      
      $("body").css({minHeight: $(window).height() + 100});
      $("body").scrollTop(0);
      
      $(".main-nav-container .flexslider").css({
         marginTop: ($(window).height() / 2) - $("footer").height()
      })
      
      MBP.hideUrlBarOnLoad();
      App.navInit();
      App.bindCustomEvents();
      //App.windowLoaded();
   },
   bindCustomEvents: function() {
      $(window).resize(function() {
         $(".wallpaper").css({height: $("body").height(), width: $("body").width()});
      });
      $(window).resize();
      
      $(".home-trigger").click(function(e) {
         e.preventDefault();
         window.location.hash = "home";
         $(".page").fadeOut(App.Config.animSpeed);
         $(".home-trigger, .back-trigger").fadeOut(App.Config.animSpeed);
         $("body").scrollTop(0);
         $(".page .page-content .scrollable-area").html("");
         $(".footer-menu-trigger").removeClass("active");
         $(".footer-menu").fadeOut(App.Config.animSpeed);
      });
      
      $(".back-trigger").click(function(e) {
         e.preventDefault();
         history.back();
      });
      
      
      $(".page-content").scroll(function(e) { //to hide nav bar if scrolling down inside page div
         if ($(".page-content").scrollTop() > 124) {
            $("body").scrollTop(0);
            //$(".page").height("99%");
            setTimeout(function() {
               //$(".page").height("100%");
            }, 1000);
            //$(".page-content").css({height: $("footer").offset().top});
         }
         if ($(".page-content").scrollTop() < 2) {
            //$(".page-content").scrollTop(2);
            //e.preventDefault();
         }
      });
      
      $(".footer-menu-trigger").click(function(e) {
         e.preventDefault();
         $(".footer-menu-trigger").toggleClass("active");
         $(".footer-menu").fadeToggle();
      });
      $(".footer-menu a, .footer-menu-bg").click(function() {
         $(".footer-menu-trigger").removeClass("active");
         $(".footer-menu").fadeOut(App.Config.animSpeed);
      });
      $(".footer-menu a").click(function() {
         $(".page-nav a.active").removeClass("active");
      })
      App.ajaxLinkify($(".footer-menu a.ajaxify"));
      
      
      //android has a bug for div scrolling, before honeycomb version, it didn't allow for div scrolling and hence we use iScroll only for android browsers
      if (true || (App.Util.mobile.detect() && App.Util.mobile.detect() == "android")) {
         $(".page-content").bind("touchmove", function(e) {
            e.preventDefault();
         });
         
         App.iScrollVariable = new iScroll('page-content', {
            hScrollbar: false,
            vScrollbar: true,
            snap: false,
            momentum: false
         });
         
         $('.page-content').bind("mousewheel", function(event, delta, deltaX, deltaY){   
                
                if (delta > 0){
                    if (App.iScrollVariable.y >= 0)
                        return;
                    App.iScrollVariable.scrollTo(0, -80, 200, true)
                }else if (delta < 0){
                    if ($(window).height() + Math.abs(App.iScrollVariable.y) >= $(".page-content .scrollable-area").height())
                        return;
                    App.iScrollVariable.scrollTo(0, 80, 200, true)
                }
                return false;
        });  
         
         //myScroll.scrollTo(0, 10, 200, true)
      }
   },
   pageInit: function() {
      $("body").scrollTop(0);
      
      //initialize flexslider inside page content
      $('.page-content .scrollable-area .flexslider:not(.flexslidered)').addClass("flexslidered").flexslider({
         animation: "slide",
         controlNav: false,
         start: function() {
             try {App.iScrollVariable.refresh();} catch(e) {}
         }
       });
      
      //custom checkboxes
      $('.page-content .scrollable-area .on-off:not(.iphoneStyled)').addClass("iphoneStyled").iphoneStyle();
      
      //initialize photoswipe for portfolio page
      if ($(".page-content .scrollable-area .portfolio a:not(.photoSwiped)").length) //dont run if already ran before
         $(".page-content .scrollable-area .portfolio a:not(.photoSwiped)").addClass("photoSwiped").photoSwipe({});
      
      //for portfolio page   
      if ($(".list-grid").length) {
         $(".portfolio li:nth-child(3n) a").addClass("last");
         
         $.each($(".list-grid a"), function(i, elem) {
            $(this).click(function(e) {
               e.preventDefault();
               $(".list-grid a").toggleClass("active");
               $("ul.portfolio").removeClass("list").removeClass("grid").addClass($(".list-grid a.active").attr("data-class"));
               try {App.iScrollVariable.refresh();} catch(e) {}
            });
         });
      }
      
      //for blog page   
      if ($(".list-summary").length) {
         
         $.each($(".list-summary a"), function(i, elem) {
            $(this).click(function(e) {
               e.preventDefault();
               $(".list-summary a").toggleClass("active");
               $(".blog-article").removeClass("summary").removeClass("list").addClass($(".list-summary a.active").attr("data-class"));
               try {App.iScrollVariable.refresh();} catch(e) {}
            });
         });
      }
      
      //bind form validations
      App.Forms.bind();
      
	  //maps
      App.refreshMaps();

      //afterPageInit: recommended system routine after each page loaded - do not remove this
      App.afterPageInit();
   },
   beforePageInit: function() {
      //responsive layout treatment begin
      $(".page .page-nav h2").html($(".page .page-content .scrollable-area h2:first").html());
      //$(".page .page-content .scrollable-area h2:first").remove();
   },
   afterPageInit: function() {
      //linkify page-content links to open via ajax conditionally
      App.ajaxLinkify($(".page-content .scrollable-area a.ajaxify"));
      
      //tap event effects for links
      $("a:not(.tapInEffected)").addClass("tapInEffected").bind("touchstart mousedown", function() {
         $(this).addClass("hover");
      });
      $("a:not(.tapOutEffected)").addClass("tapOutEffected").bind("touchmove touchend mouseup", function() {
         $(this).removeClass("hover");
      });
      setTimeout(function() {
          try {
              App.iScrollVariable.refresh();
          } catch(e) {}
         
      }, 1);
      
   },
   navInit: function() {
      //if nav-items are more than default (5), resize width to fit:
      if (App.Config.pagesViaAjax) {
         $("#main-nav a").click(function(e) {
            e.preventDefault();
            
            $("body").scrollTop(0);
            var me = this;
            App.Util.showLoading(function() { //once loading graphic is shown, do ajax request to get page
               $.ajax({
                  url: $(me).attr("href").replace("#", ""),
				  dataType: 'text',
                  success: function(r) {
                      r = r + "<br/><br/><br/><br/>";
                     $(".page .page-content .scrollable-area").html(r);
                     //we wait here for a while for the iphone safari address bar to close
                     setTimeout(function() {
                        App.beforePageInit();
                        App.Util.doneLoading(function() {
                           App.Util.activateMenu(me);   
                           App.pageInit();
                        });
                     }, 600);
                     
                  }
               })
            });
         });
         
         $(".page-nav ul li a").click(function(e) {
            e.preventDefault();
            $("body").scrollTop(0);
            var me = this;
            App.Util.activateMenu(me);
            App.Util.showLoadingResponsive(function() { //once loading graphic is shown, do ajax request to get page               
			   $.ajax({
                  url: $(me).attr("href").replace("#", ""),
				  dataType: 'text',
                  success: function(r) {
                      r = r + "<br/><br/><br/><br/>";
                     $(".page .page-content .scrollable-area").html(r);
                     App.beforePageInit();
                     App.Util.doneLoading(function() {
                        App.pageInit();
                     });
                  }
               })
            });
         });
      }
      
      $(window).bind("hashchange", App.processHash);
      
   },
   processHash: function() {
      hash = window.location.hash;
      if (hash)
         $(hash).click();
      if (hash == "#home")
         $("#home-button").click();
   },
   ajaxLinkify: function(el) {
      $(el).click(function(e) {
         e.preventDefault();
         var me = this;
         App.Util.showLoadingResponsive(function() { //once loading graphic is shown, do ajax request to get page
            $.ajax({
               url: $(me).attr("href"),
			   dataType: 'text',
               success: function(r) {
                  App.Util.silentHashChange($(me).attr("id") == undefined ? "#link" : $(me).attr("id"));
                  r = r + "<br/><br/><br/><br/>";
                  $(".page .page-content .scrollable-area").html(r);
                  //we wait here for a while for the iphone safari address bar to close after ajax request
                  setTimeout(function() {
                     App.beforePageInit();
                     App.Util.doneLoading(function() {
                        App.pageInit();
                     });
                  }, 600);
                  
               }
            })
         });
      });
   },
   /*windowLoaded: function() {
      if (window.location.hash && $(window.location.hash).length) {
         App.processHash();
         setTimeout(function() {
            $("#splash").fadeOut()
         }, App.Config.splashScreenDuration);
      } else {
         $(".navigation a:first").click();
         setTimeout(function() {
            $("#splash").fadeOut()
         }, App.Config.splashScreenDuration);
         window.location.hash = "home";
      }
   },*/
   Util: {
      showLoading: function(callback) {
         $(".loading-progress").show();
         $(".page-content .scrollable-area *").unbind("click");
         $(".page .page-content").fadeOut(App.Config.animSpeed);
         setTimeout(function() {
            callback();
         }, 501);
      },
      showLoadingResponsive: function(callback) {
         $(".loading-progress").show();
         $(".page-content .scrollable-area *").unbind("click");
         $(".page-content").fadeOut(App.Config.animSpeed);
         setTimeout(function() {
            callback();
         }, 501);
      },
      doneLoading: function(callback) {
         $(".loading-progress").hide();
         
         $(".page-content").fadeIn(App.Config.animSpeed, function() {
            $(this).scrollTop(0);
            callback();
         });
         $(".page").fadeIn(App.Config.animSpeed);
         $(".home-trigger, .back-trigger").fadeIn(App.Config.animSpeed);
      },
      activateMenu: function(el) {
         $(document).ready(function() {
            $("#main-nav .active, .page-nav li .active").removeClass("active");
            $(el).addClass("active");
            $("#nav-" + $(el).attr("id")).addClass("active");
            App.Util.silentHashChange($(el).attr("id") != undefined ? $(el).attr("id") : "")
            $("body, html").scrollTop(0);
         });
      },
      silentHashChange: function(hash) {
         $(window).unbind("hashchange");
         window.location.hash = hash;
         setTimeout(function() {
            $(window).bind("hashchange", App.processHash);
         }, 100);
      },
      mobile: {
         detect:function(){
            var uagent = navigator.userAgent.toLowerCase(); 
            var list = this.mobiles;
            var ismobile = false;
            for(var d=0;d<list.length;d+=1){
                    if(uagent.indexOf(list[d])!=-1){
                            ismobile = list[d];
                    }
            }
            return ismobile;
         },
         mobiles:[
            "midp","240x320","blackberry","netfront","nokia","panasonic",
            "portalmmm","sharp","sie-","sonyericsson","symbian",
            "windows ce","benq","mda","mot-","opera mini",
            "philips","pocket pc","sagem","samsung","sda",
            "sgh-","vodafone","xda","palm","iphone",
            "ipod","android"
         ]
       }
   },
   Forms: {
      bind: function() {
         // Add required class to inputs
         $(':input[required]').addClass('required');
         
         // Block submit if there are invalid classes found
         $('form:not(.html5enhanced)').addClass("html5enhanced").submit(function() {
               var formEl = this;
                 $('input,textarea').each(function() {
                         App.Forms.validate(this);
                 });
                 
                 if(($(this).find(".invalid").length) == 0){
                         // Delete all placeholder text
                         $('input,textarea').each(function() {
                                 if($(this).val() == $(this).attr('placeholder')) $(this).val('');
                         });
                         
                         //now submit form via ajax
                         $.ajax({
                           url: $(formEl).attr("action"),
                           type: $(formEl).attr("method"),
                           data: $(formEl).serialize(),
                           success: function(r) {
                              if (r) {
                                 $(".success-message").slideDown().removeClass("hidden");
                              }
                           }
                         })
                         return false;
                 }else{
                         return false;
                 }
         });

      },
      is_email: function(value){
	return (/^([a-z0-9])(([-a-z0-9._])*([a-z0-9]))*\@([a-z0-9])(([a-z0-9-])*([a-z0-9]))+(\.([a-z0-9])([-a-z0-9_-])?([a-z0-9])+)+$/).test(value);
      },
      is_url: function(value){
              return (/^(http|https|ftp):\/\/([A-Z0-9][A-Z0-9_-]*(?:\.[A-Z0-9][A-Z0-9_-]*)+):?(\d+)?\/?/i).test(value);
      },
      is_number: function(value){
              return (typeof(value) === 'number' || typeof(value) === 'string') && value !== '' && !isNaN(value);
      },
      validate: function(element) {
         var $$ = $(element);
         var validator = element.getAttribute('type'); // Using pure javascript because jQuery always returns text in none HTML5 browsers
         var valid = true;
         var apply_class_to = $$;
         
         var required = element.getAttribute('required') == null ? false : true;
         switch(validator){
                 case 'email': valid = App.Forms.is_email($$.val()); break;
                 case 'url': valid = App.Forms.is_url($$.val()); break;
                 case 'number': valid = App.Forms.is_number($$.val()); break;
         }
         
         // Extra required validation
         if(valid && required && $$.val().replace($$.attr('placeholder'), '') == ''){
                 valid = false;
         }
         
         // Set input to valid of invalid
         if(valid || (!required && $$.val() == '')){
                 apply_class_to.removeClass('invalid');
                 apply_class_to.addClass('valid');
                 return true;
         }else{
                 apply_class_to.removeClass('valid');
                 apply_class_to.addClass('invalid');
                 return false;
         }
      }

   },
   refreshMaps: function(){
      if (!$(".map").length)
         return;
      $('.map').each(function(){
           var me = $(this);
           var locationTitle = $(this).attr('data-location');
           var myId = $(me).attr('id');
           var geocoder = new google.maps.Geocoder();
           geocoder.geocode({
                address: locationTitle
            }, function(locResult) {
                var latVal = locResult[0].geometry.location.lat();
                var longVal = locResult[0].geometry.location.lng();
                App.initializeMap(myId, locationTitle, latVal, longVal);
            });
      });
   },
   initializeMap: function(locationVal, titleVal, latVal, longVal) {
      var latlng = new google.maps.LatLng(latVal, longVal);
      var settings = {
              zoom: 13,
              center: latlng,
              mapTypeControl: false,
              mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
              navigationControl: false,
              navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
              streetViewControl: false,
              zoomControl: true,
              mapTypeId: google.maps.MapTypeId.ROADMAP 
      };
      var map = new google.maps.Map(document.getElementById(locationVal), settings);
      
      
      var nibrasPos= new google.maps.LatLng(latVal, longVal);
      var nibrasMarker = new google.maps.Marker({
                position: nibrasPos,
                map: map,
                title:titleVal
      });
   }
}

$(document).ready(App.init);

//$(window).load(App.windowLoaded);