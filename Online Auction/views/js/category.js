
//count down
var i = 0
var length = 12
var days,hours,minutes,seconds 
var distance
var countDownDate=new  Array(length)
var allTimeRemaining = $(document).find('.product_expiration_date')

for (i = 0; i < allTimeRemaining.length; i++) {
    countDownDate[i] = new Date(allTimeRemaining[i].textContent).getTime();
}
var x = setInterval(function() {
    var now = new Date().getTime();
    for (i = 0; i < length; i++) {
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





var tableData = [{
        'name': 'Russell',
        'price': '$150',
        'time': 'November 20, 2019 20:15:10',
    }]


function buildTable() {
    var table =$('#data')

 // var row=`<div class="product-item  smartphone">
 //                                        <div class="product product_filter">
 //                                            <div class="product_image">
 //                                                <img src="images/product_1.jpg" alt="">
 //                                            </div>
 //                                            <div class="favorite favorite_left"></div>
 //                                            <div class="product_info">
 //                                                <h6 class="product_name"><a href="single.html">${tableData[0].name}
                                                
 //                                                </a></h6>
 //                                                <div class="product_price">${table[0].price}</div>
 //                                                <div class="product_time_remaining">${table[0].time}</div>
 //                                            </div>
 //                                        </div>
 //                                        <div class="red_button auction_button"><a href="#">
 //                                                <img src="images/auction.png" alt="">
 //                                            </a></div>
 //                                    </div>
 //                                    `

var row=` <div>123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123
                                    
                                </div>`

        table.append(row)

}
