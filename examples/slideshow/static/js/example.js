(function($, W){
    
    // Code snatched from: http://stackoverflow.com/questions/210717/what-is-the-best-way-to-center-a-div-on-the-screen-using-jquery
    $.fn.center = function (relation) {
        var center_in = (relation) ? $(relation) : $(window);
        
        this.css("position","absolute");
        this.css("top", ( center_in.height() - this.height() ) / 2+center_in.scrollTop() + "px");
        this.css("left", ( center_in.width() - this.width() ) / 2+center_in.scrollLeft() + "px");
        return this;
    };
    
    var generateMapUrl = function(location, width, height){
        var base = "http://maps.google.com/maps/api/staticmap?",
            l = location['lat'] + "," + location['lon'],
            wt = (width > 640) ? 640 : width,
            ht = (height > 640) ? 640 : height,
            wh = wt + "x" + ht,
            url = base + "center=" + l + "&zoom=12&size="+wh+"&maptype=roadmap&markers=color:red|color:red|" + l + "&sensor=false",
            img_src = "<img src='"+url+"' width='"+wt+"' height='"+ht+"'>";
            
        return img_src;
    },
    
    slide_time,
        
    slideshow = function(selector, index){
        clearTimeout(slide_time);
        var selection = $(selector),
            elem = $(selection.get(index)),
            length = selection.length,
            src = elem.attr("data-src"),
            width = elem.attr("data-width"),
            height = elem.attr("data-height"),
            caption = elem.attr("data-caption"),
            city = elem.attr("data-city"),
            place = elem.attr("data-place"),
            location = {
                lat: elem.attr("data-lat"),
                lon: elem.attr("data-lon")
            },
            img = "<img src='"+src+"' width='"+width+"' height='"+height+"'>",
            pic_holder = $(".pic-holder"),
            pic_holder_width = pic_holder.width() - 10, 
            pic_holder_height = pic_holder.height() - 10,
            map_src,
            map_holder = $(".map-holder");
          
        map_holder.empty();
        if(location.lat != ""){
            map_src = generateMapUrl(location,map_holder.width(),map_holder.height() );
            $(map_src).fadeOut().appendTo(map_holder).aeImageResize({ height: map_holder.height(), width: map_holder.width() }).center(map_holder);
        } else {
            map_holder.append("<em>" + caption + "</em>");
        }
        $(".grid-holder").scrollTo( elem, {duration:2500, easing:'swing', over:-0.1});
        $(elem.parents('li').first()).addClass("selected");
       
        $(".pic-holder img").fadeOut('slow');
        $(".pic-holder").empty();
        img = $(img).hide().appendTo('.pic-holder');
        img.aeImageResize({ height: pic_holder_height, width: pic_holder_width });
        img.center('.pic-holder').fadeIn("slow");
         
        if($(selector).length == (index + 1)){
            index = 0;
        }

        slide_time = setTimeout(function(){
            $(elem.parents('li').first()).removeClass("selected");
            slideshow(selector, index + 1);
        }, 4000);
        
        if((length - index) < 5){
            $.picplz_window_media.appendMore();
        }
        
    };
    
    $.picplz_window_media = {
        init: function(token){
            var that = this;
            if(token){
                $.picplz.init(token);
            }
            
            $(".pic-grid li img").live("click", function(e){
                e.preventDefault();
                var index = $(".pic-grid li img").index(e.target);
                slideshow(".pic-grid li img", index);
                
                return false;
            });

        },
        renderData: function(data){
            var html = "";
            $.each(data.pics, function(i, val){
                var url = "http://picplz.com" + val.url,
                    src = val.pic_files["100sh"].img_url,
                    w = val.pic_files["100sh"].width,
                    h = val.pic_files["100sh"].height,
                    l = val.pic_files["640r"].img_url,
                    lw = val.pic_files["640r"].width,
                    lh = val.pic_files["640r"].height,
                    caption = val.caption,
                    city = (val.city) ? val.city.name : "",
                    place = (val.place) ? val.place.name : "",
                    lat = (val.location) ? val.location.lat : "",
                    lon = (val.location) ? val.location.lon : "",
                    string = [
                        "<li><a href='"+url+"' target='_blank'>",
                        "<img src='"+src+"' ",
                        "width='"+w+"' ",
                        "height='"+h+"' ",
                        "data-src='"+l+"' ",
                        "data-width='"+lw+"' ",
                        "data-height='"+lh+"' ",
                        "data-caption='"+ caption +"' ",
                        "data-place='"+ place +"' ",
                        "data-city='"+ city+"' ",
                        "data-lat='"+ lat +"' ",
                        "data-lon='"+ lon +"' ",
                        "></a></li>"].join("");
                html = html + string;
            });
            
            return html;
        },
        handleData: function(data, first, more_pics){
            var html = this.renderData(data);
            if(first){
                this.last_pic_id = false;
                this.more_pics = more_pics;
                html = "<ul class='pic-grid line'>" + html + "</ul>";
                $(".grid-holder").empty().html(html);
                slideshow(".pic-grid li img", 0);
            } else {
                $(".grid-holder ul").append(html);
            }
            
            
            if(data.more_pics){
                this.last_pic_id = data.last_pic_id;
            } else {
                this.last_pic_id = false;
            }
        },
        intrestingFeed: function(first, last_pic_id){
            var that = this;
            if(first){
                $(".feed-title").html("<em>Pics<br>At</br>Your Network</em>");
            }
            $.picplz.interesting(function(data){
                that.handleData(data, first, function(last_pic_id){
                    $.picplz_window_media.intrestingFeed(false, last_pic_id);
                });
            },last_pic_id);
        },
        networkFeed: function(first, last_pic_id){
            var that = this;
            $.picplz.network(function(data){
                that.handleData(data, first, function(last_pic_id){
                    $.picplz_window_media.networkFeed(false, last_pic_id);
                });
            },last_pic_id);
        },
        cityFeed: function(first, key, last_pic_id){
            var that = this;
            if(first){
                $(".feed-title").html("<em>Pics<br>In</br>San Francisco</em>");
            }
            console.log("here");
            $.picplz.cityById(function(data){
                data = data.cities[0];
                that.handleData(data, first, function(last_pic_id){
                    $.picplz_window_media.cityFeed(false, key, last_pic_id);
                });
            }, key, false, true);
        },
        placeFeed: function(first, key, last_pic_id){
            var that = this;
            if(first){
                $(".feed-title").html("<em>Pics<br>At</br><a href='http://picplz.com/pics/california-academy-of-sciences-san-francisco-ca/'>California Academy <br> of Sciences</a></em>");
            }
            $.picplz.placeBySlug(function(data){
                data = data.places[0];
                console.log("Here", data);
                that.handleData(data, first, function(last_pic_id){
                    $.picplz_window_media.placeFeed(false, key, last_pic_id);
                });
            }, key, false, true);
        },
        userFeed: function(first, key, last_pic_id){
            var that = this;
            if(first){
                $(".feed-title").html("<em>Pics<br>taken by</br><a href='http://picplz.com/user/lagartija/'>lagartija</a></em>");
            }
            $.picplz.userByUsername(function(data){
                data = data.users[0];
                that.handleData(data, first, function(lafst_pic_id){
                    $.picplz_window_media.userFeed(false, key, last_pic_id);
                });
            }, key, false, true);
        },
        appendMore: function(){
            if(this.last_pic_id && this.more_pics){
                this.more_pics(false, this.last_pic_id);
            }
        }
    };
    
    
    $("a[href='#/yournetwork/']").click(function(e){
        e.preventDefault();
        if(!localStorage.oauth_token){
            window.location = "https://picplz.com/oauth2/authenticate?client_id=emeTeCxMtHAXJXT8Yu4KxuBvYwwGDGyv&response_type=token&redirect_uri=http://127.0.0.1:8010/index.html";
        } else {
            $.picplz.network(function(data){
                console.log(data);
            });
        }
        return false;
    });
    $("a[href='#/id/3/']").click(function(e){
        e.preventDefault();
        $.picplz_window_media.cityFeed(true, 3);
        return false;
    });
    $("a[href='#/slug/california-academy-of-sciences-san-francisco-ca/']").click(function(e){
        e.preventDefault();
        $.picplz_window_media.placeFeed(true, 'california-academy-of-sciences-san-francisco-ca');
        return false;
    });
    $("a[href='#/username/lagartija/']").click(function(e){
        e.preventDefault();
        $.picplz_window_media.userFeed(true, 'lagartija');
        return false;
    });
    
})(jQuery, window);



$(function(){
    if(document.location.hash){
        var hash = document.location.hash;
            token = unescape(hash.split("=")[1]);
        $.picplz_window_media.init(token);
        $.picplz_window_media.networkFeed(true);
    } else {
        $.picplz_window_media.init();
        $.picplz_window_media.intrestingFeed(true);
    }
    
});