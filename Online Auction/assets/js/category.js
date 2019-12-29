
//count down
var i = 0
var length = 1000
var days,hours,minutes,seconds 
var distance
var countDownDate=new  Array(length)
var allTimeRemaining = $(document).find('.product_expiration_date')

for (i = 0; i < allTimeRemaining.length; i++) {
    countDownDate[i] = new Date(allTimeRemaining[i].textContent).getTime();
}
var x = setInterval(function() {
    var now = new Date().getTime();
    for (i = 0; i < allTimeRemaining.length; i++) {
         distance = countDownDate[i] - now;
         days = Math.floor(distance / (1000 * 60 * 60 * 24));
         hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
         minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
         seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (days==0) {
        		 allTimeRemaining[i].innerHTML =  hours + "h " +  minutes + "m " + seconds + "s ";
        }else
        allTimeRemaining[i].innerHTML = days + "d " + hours + "h " +  minutes + "m " + seconds + "s ";
        if (distance < 0) {
            allTimeRemaining[i].innerHTML = "ENDING";
        }
    }

}, 1000);
