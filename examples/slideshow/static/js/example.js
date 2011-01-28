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
            
        console.log(location);
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
        init: function(){
            var that = this;
            this.getList(true);
            $(".pic-grid li img").live("click", function(e){
                e.preventDefault();
                var index = $(".pic-grid li img").index(e.target);
                slideshow(".pic-grid li img", index);
                
                return false;
            });
        },
        handleData: function(data, first){
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
            if(first){
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
        getList: function(first, last_pic_id){
            var that = this;
            $.picplz.interesting(function(data){
                that.handleData(data, first);
            },last_pic_id);
        },
        appendMore: function(){
            if(this.last_pic_id){
                this.getList(false, this.last_pic_id);
            }
        }
    };
    
})(jQuery, window);



$(function(){
    $.picplz_window_media.init();
});