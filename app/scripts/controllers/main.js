 'use strict';

angular.module('frontendApp')

.controller('MainCtrl', function ($scope, messages) {
  $scope.mp = messages;
})
.service('messages', function($rootScope){

  this.messages = [];
  this.idea = {cnt:100, text:'' };
  this.messagecounter = {cnt:0, text:'' };

  var sock = new SockJS('http://localhost:5000/echo');
 
  var that = this;
  sock.onopen = function sockOnOpen() {
      
  };
  sock.onmessage = function(e) {
      var msg = e.data;
      try{
      var obj = JSON.parse(msg);
        switch(obj.id){
          case 'init':
            $rootScope.$apply(function(){
              for(var u = 0; u < obj.data.length; u++){
                that.messages.unshift(obj.data[u]);
              }
            });
          break;
          case 'update':
            $rootScope.$apply(function(){
              that.messages.unshift(obj.data);
            });
          break;
        }
      }catch(e){
        console.log(e); 
      }
  };
  
  sock.onclose = function sockOnClose() {
    console.log('closed');
  };
  
  this.push = function push(message){
    sock.send(message);
  }
  
})

.directive('infTextarea', function(messages){
    
  function link(scope, element, attrs) {
  
    element.on('keydown', function(e){
      if(e.keyCode == 13){
          e.preventDefault();
      }
    });
  
    element.on('keyup', function(e){
       if(element.val().length > 100){
            element.val(element.val().substring(0,100));
       }
    
       if(e.keyCode == 13){
          e.preventDefault();
          scope.$apply(function(){
            messages.push(element.val());
          });
          element.val('');
       }
       scope.$apply(function(){
          messages.idea.cnt = 100 - element.val().length;
       });

    });
  }

  return {
    link: link
  };
})
.directive('scrollHeader', function($compile, $window) {
     // 'use strict';
      return {
         restrict: 'A',
         scope: false,
         link: function(scope, element, attrs) {

            element.css({
               position: 'fixed',
               transition: 'top 0.2s',
               top: '0px'
            });

            var navbarHeight = element[0].offsetHeight;
            console.log(navbarHeight);
            var windowObj = angular.element($window);

            var timer = null;
            var lastScrollTop = 0;
            var topScrollOffset = parseInt(attrs.topScrollOffset || 0);
            var scrollOffSet = parseInt(attrs.scrollOffSet || 0);
            var scrollInterval = parseInt(attrs.scrollInterval || 0);
            var lastTopValue = 0;
            var topValue = 0;

            var onScrollInterval = function() {

               var currectScrollPosition = $window.pageYOffset || $window.document.documentElement.scrollTop;

               // Make sure they scroll more than scrollOffSet
               if (Math.abs(lastScrollTop - currectScrollPosition) > scrollOffSet) {
                  var hideHeader = currectScrollPosition > lastScrollTop && currectScrollPosition > (navbarHeight  + topScrollOffset);

                  //only change DOM if required
                  if ((topValue = hideHeader ? - navbarHeight + 'px' : 0) !== lastTopValue) {
                     element.css({
                        top: topValue,
                        transition:'top 0.2s'
                     });
                  }

                  lastScrollTop = currectScrollPosition;
                  lastTopValue = topValue;
               }
            };
            var onScroll = function() {

               if (timer) {
                  $window.clearTimeout(timer);
               }
               timer = $window.setTimeout(onScrollInterval, scrollInterval);

            };
            windowObj.on('scroll', onScroll);

            // Bit of clean up
            scope.$on('$destroy', function() {
               if (timer) {
                  $window.clearTimeout(timer);
               }
               windowObj.on('scroll', onScroll);
            });
         }
      };
   })

