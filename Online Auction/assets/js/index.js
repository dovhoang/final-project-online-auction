


function createRateStars() {
    var strTmp='';
    var k;
    var allRate = $(document).find('.stars');
    for (x = 0; x < allRate.length; x++) {
        strTmp='';
        var n=allRate[x].textContent;
        for ( i = 0; i < 2 * n-1; i+=2){
            strTmp+='<li><i class="fa fa-star" aria-hidden="true"></i></li>';
        }
        if ((n*2-1)%2==0) 
        {strTmp+='<li><i class="fa fa-star-half" aria-hidden="true"></i></li>';
        k=2} else k=0;
        for ( i =n*2 ; i <10-k; i+=2){
            strTmp+=' <li><i class="fa fa-star-o" aria-hidden="true"></i></li>';
        }
        allRate[x].innerHTML=strTmp;
    }
}
createRateStars();
//count down
var i = 0
var length = 15
var days,hours,minutes,seconds 
var distance
var countDownDate=new Array(length)
var allTimeExp = $(document).find('.time_exp')
var allTimeRemaining = $(document).find('.product_expiration_date')

for (i = 0; i < allTimeRemaining.length; i++) {
    countDownDate[i] = new Date(allTimeExp[i].textContent).getTime();
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

