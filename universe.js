var Class = function(m) {
	var c = function() {
		this.initialize.apply(this, arguments);
	};

	for (var property in m) { 
		c.prototype[property] = m[property];
	}
	
	if (!c.prototype.initialize) c.prototype.initialize = function(){};
	return c;
};

var Universe = new Class({
	initialize: function(){
		var self = this;
		if($("#universe").hasClass("touch")){
		
		} else {
			$("#universe").offset({"left": -($("#universe").width() - $(window).innerWidth())/2, "top":-($("#universe").height() - $(window).innerHeight())/2}); //starting position
		}
		$("#universe>div").draggable({
			containment:"parent"
		});
		
		self.resize();
		self.maxZ = 30;
		$(window).resize(function(e){
			self.resize();
		});
		
		self.getWishes();
		self.page = 1;
		
		//poller to get new wishes, disable this by simply removing this.
		window.setInterval(function(){
			self.getWishes(self.page);
			self.page++;
		}, 301000);
		
		/*dragging the map*/
		self.mousedown = false;
		self.isDrag = false;
		self.inPreview = false;
		
		
		$("#universe").bind("mousedown", function(e){
			if(!self.mousedown){
				self.startspot = {"left":e.pageX, "top":e.pageY};
				self.universeorig = $("#universe").offset();
				self.mousedown = true;
				self.mousedowntime = new Date();
			}
		});
		$("#universe").bind("mouseup", function(e){
			self.mousedown = false;
			self.isDrag = false;
		});
		
		$("#universe").bind("mousemove", function(e){
			if(self.mousedown){
				self.isDrag = true;
				var offset = $("#universe").offset();
				$("#universe").css({"top": self.universeorig.top - (self.startspot.top - e.pageY), "left":self.universeorig.left - (self.startspot.left - e.pageX)});
				offset = $("#universe").offset();
				
				if(offset.left > 0 || offset.left < self.farright || offset.top > 0 || offset.top < self.farbottom){
					//$("#universe").offset({"left":0, "top":offset.top});
					if(offset.left > 0){
						$("#universe").css({"left":0, "top":offset.top});
					} else if(offset.left < self.farright){
						$("#universe").css({"left":self.farright, "top":offset.top});
					}
					offset = $("#universe").offset(); //in case we updated the left
					if(offset.top > 0){
						$("#universe").css({"left":offset.left, "top":0});
					} else if(offset.top < self.farbottom){
						$("#universe").css({"left":offset.left, "top":self.farbottom});
					}
					
				}
			}
		});
		
		/*clicking on the universe*/
		$("#universe").click(function(e){
			var d = new Date();
			//this is stupid, but we're defining a click by the number of milliseconds it's been since the mouse button was down
			if(d - self.mousedowntime < 150 && !self.inPreview){
				if($("#dealmaker").is(":visible")){
					$("#dealmaker").fadeOut();
				} else {
					var unioffset = $("#universe").offset();
					var top = -unioffset.top+e.pageY;
					var left = -unioffset.left + e.pageX;
					$("#dealmaker").css({"top":top,"left":left}).fadeIn();
				}
			}
		});
		
		$("#universe>div").bind("mousedown", function(e){
			e.stopPropagation();
		});
		
		$("#dealmaker").click(function(e){
			switch($(e.target).attr("id")){
				case "previewBtn":
					
					self.inPreview = true;
					var data = {
						wish: $("#wish").val().substr(0, 250),
						offer: $("#offer").val().substr(0, 250),
						country: $("#country").val(),
						x:$("#dealmaker").position().left,
						y:$("#dealmaker").position().top
					};
					var wishdiv = self.displayWish({
						wish: data.wish,
						offer: data.offer,
						x: data.x,
						y: data.y,
						country: data.country
					});
					wishdiv.append($("<div id='previewControl'><span href='#' id='sendBtn'></span><span href='#' id='closeBtn'></span></div>"));
					wishdiv.css("zIndex", self.maxZ);
					self.maxZ++;
					$("#dealmaker").fadeOut();
					$("#sendBtn").click(function(){
						if(!self.inProgress){
							$.ajax("makewish.php", {
								type: "GET",
								data: {
									wish: data.wish,
									offer: data.offer,
									country: data.country,
									x:wishdiv.position().left,
									y:wishdiv.position().top
								},
								dataType: "json",
								beforeSend: function(){
									self.inProgress = true;
									self.busyOverlay = $("<div class='abs-overlay'><div class='wait'><div></div><div></div><div></div></div></div>");
									wishdiv.append(self.busyOverlay);
								},
								success: function(data, text, xhr){
									
									self.busyOverlay.remove();
									if(data.success){
										$("#previewControl").remove();
										self.inPreview = false;
										
										$("#wish").val("");
										$("#offer").val("");
									}
								},
								error: function(xhr, text, er){
								},
								complete: function(){
									self.inProgress = false;
								}
							});
						}
					});
					
					$("#closeBtn").click(function(){
						$("#dealmaker").css({"top":wishdiv.position().top,"left":wishdiv.position().left}).fadeIn();
						wishdiv.remove();
						self.inPreview = false;
					});
					
					//do an ajax call to post the deal
					
					break;
				case "cancelBtn":
					//close the UI
					$("#dealmaker").fadeOut();
					break;
					
			}
		});
		
		$("a").click(function(e){
			if($(e.target).attr('data-link')){
				switch($(e.target).attr('data-link')){
					case "#how":
					case "#home":
					case "#policy":
						var ele = $($(e.target).attr('data-link'));
						var position = ele.position();
						var top = position.top + ele.innerHeight()/2;
						var left = position.left + ele.innerWidth()/2;
						self.center(left, top);
						break;
				}
			}
		});
		$("#compass").click(function(e){
			if($("#links").is(":visible")){
				$("#links").fadeOut();
			} else {
				$("#links").fadeIn();
			}
		});
	},
	getWishes: function(){
		var self = this;
		$.ajax("getwishes.php", {
			type:"GET",
			data: {"page":self.page},
			dataType:"json",
			success:function(data, text, xhr){
				for(var i in data.wishes){
					self.displayWish(data.wishes[i], 300000);
				}
				if(data.wishes.length < 100){
					self.page = 0;
				}
				self.wishescount = data.count;
			}
		});
	},
	displayWish: function(wish, ttl){
		var self = this;
		var wishdiv = $("<div></div>");
		wishdiv.addClass("wish");
		
		wishdiv.css({"top":parseInt(wish.y),"left":parseInt(wish.x)});
		if(!wish.wish){
			wish.wish="absolutely nothing!";
		}
		if(!wish.offer){
			wish.offer="do nothing at all.";
		}
		//console.log(wish);
		wish.wish.trim();
		if(wish.stars){
			wish.stars = parseInt(wish.stars);
			if(wish.stars > 10){
				wishdiv.css("box-shadow", "0px 0px 8px #FE0");
				wishdiv.css("background-color", "#56EDFF")
			} else {
				wishdiv.css("box-shadow", "0px 0px "+(wish.stars*4)+"px #0DF inset");
			}
		}
		
		if(wish.wish.length > 0){
			var lastchar = wish.wish.charAt(wish.wish.length-1);
			if (lastchar.match(/^[0-9a-z]+$/)){
				wish.wish+=".";
			}
		}
		wishdiv.html("I would like "+wish.wish+" In return I will "+wish.offer+"<br>");
		if(wish.country){
			wishdiv.append($("<span class='sig'>-Someone in "+wish.country+"</span>"));
		} else {
			wishdiv.append($("<span class='sig'>-Someone from Earth?</span>"));
		}
		wishdiv.draggable({containment:"parent"});
		wishdiv.mousedown(function(e){
			e.stopPropagation();
			wishdiv.css("zIndex",self.maxZ);
			self.maxZ++;
		});
		
		var starbtn = $("<a href='#'>&nbsp;</a>");
		if(wish.istar){
			starbtn.addClass("fullstar");
			starbtn.click(function(){
				$.ajax("wishmgr.php?a=unstar&w="+wish.id, {
					type: "GET",
					dataType:"json",
					success:function(data, text, xhr){
						if(data.unstar){
							wish.istar = 0;
							wish.stars--;
							if(wish.stars < 0){
								wish.stars = 0;
							}
							wishdiv.remove();
							wishdiv = self.displayWish(wish);
							wishdiv.css("zIndex", self.maxZ);
							self.maxZ++;
						}
					}
				});
			});
		} else {
			starbtn.addClass("emptystar");
			starbtn.click(function(){
				$.ajax("wishmgr.php?a=star&w="+wish.id, {
					type: "GET",
					dataType:"json",
					success:function(data, text, xhr){
						if(data.star){
							wishdiv.remove();
							wish.istar = 1;
							wish.stars++;
							if(wish.stars <0){
								wish.stars = 0;
							}
							wishdiv = self.displayWish(wish);
							wishdiv.css("zIndex", self.maxZ);
							self.maxZ++;
						}
					}
				});
			});
		}
		
		if(ttl){
			window.setTimeout(function(){wishdiv.remove()}, ttl);
		}
		
		wishdiv.append(starbtn);
		$("#universe").prepend(wishdiv);
		return wishdiv;
	},
	center: function(x, y){
		var self = this;
		//figure out the top and left the universe needs to offset to make this happen
		//top should be window height/2 -y
		//left should be window width/2 -x
		var top = $(window).innerHeight()/2 - y;
		var left = $(window).innerWidth()/2 - x;
		
		if(top > 0)
			top = 0;
		else if(top < self.farbottom)
			top = self.farbottom;
		
		if(left > 0)
			left = 0;
		else if(left < self.farright)
			left = self.farright;
			
		$("#universe").animate({"top":top, "left":left});
	},
	resize: function(){
		var self = this;
		self.farright = $("#universeviewer").innerWidth() - $("#universe").innerWidth();
		self.farbottom = $("#universeviewer").innerHeight() - $("#universe").innerHeight();
	}


});

$(document).ready(function(){
	document.u = new Universe();
});