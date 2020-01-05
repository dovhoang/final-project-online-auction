/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Thumbnail
5. Init Quantity
6. Init Star Rating
7. Init Favorite
8. Init Tabs



******************************/



var execute = false;
jQuery(document).ready(function ($) {


	"use strict";

	/* 

	1. Vars and Inits

	*/

	var header = $('.header');
	var topNav = $('.top_nav')
	var hamburger = $('.hamburger_container');
	var menu = $('.hamburger_menu');
	var menuActive = false;
	var hamburgerClose = $('.hamburger_close');
	var fsOverlay = $('.fs_menu_overlay');

	setHeader();

	$(window).on('resize', function () {
		setHeader();
	});

	$(document).on('scroll', function () {
		setHeader();
	});

	initMenu();
	initThumbnail();
	initQuantity();
	initStarRating();
	initFavorite();
	initTabs();

	/* 

	2. Set Header

	*/

	function setHeader() {
		if (window.innerWidth < 992) {
			if ($(window).scrollTop() > 100) {
				header.css({ 'top': "0" });
			}
			else {
				header.css({ 'top': "0" });
			}
		}
		else {
			if ($(window).scrollTop() > 100) {
				header.css({ 'top': "-50px" });
			}
			else {
				header.css({ 'top': "0" });
			}
		}
		if (window.innerWidth > 991 && menuActive) {
			closeMenu();
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu() {
		if (hamburger.length) {
			hamburger.on('click', function () {
				if (!menuActive) {
					openMenu();
				}
			});
		}

		if (fsOverlay.length) {
			fsOverlay.on('click', function () {
				if (menuActive) {
					closeMenu();
				}
			});
		}

		if (hamburgerClose.length) {
			hamburgerClose.on('click', function () {
				if (menuActive) {
					closeMenu();
				}
			});
		}

		if ($('.menu_item').length) {
			var items = document.getElementsByClassName('menu_item');
			var i;

			for (i = 0; i < items.length; i++) {
				if (items[i].classList.contains("has-children")) {
					items[i].onclick = function () {
						this.classList.toggle("active");
						var panel = this.children[1];
						if (panel.style.maxHeight) {
							panel.style.maxHeight = null;
						}
						else {
							panel.style.maxHeight = panel.scrollHeight + "px";
						}
					}
				}
			}
		}
	}

	function openMenu() {
		menu.addClass('active');
		// menu.css('right', "0");
		fsOverlay.css('pointer-events', "auto");
		menuActive = true;
	}

	function closeMenu() {
		menu.removeClass('active');
		fsOverlay.css('pointer-events', "none");
		menuActive = false;
	}

	/* 

	4. Init Thumbnail

	*/

	function initThumbnail() {
		if ($('.single_product_thumbnails ul li').length) {
			var thumbs = $('.single_product_thumbnails ul li');
			var singleImage = $('.single_product_image_background');

			thumbs.each(function () {
				var item = $(this);
				item.on('click', function () {
					thumbs.removeClass('active');
					item.addClass('active');
					var img = item.find('img').data('image');
					singleImage.css('background-image', 'url(' + img + ')');
				});
			});
		}
	}

	/* 

	5. Init Quantity

	*/

	function initQuantity() {
		if ($('.plus').length && $('.minus').length) {
			var k = $('#priceStep').val();
			k = parseInt(k);
			var plus = $('.plus');
			var minus = $('.minus');
			var value = $('#placebid_value');

			plus.on('click', function () {
				var x = parseInt(value.text());
				value.text(x + k);
			});

			minus.on('click', function () {
				var x = parseInt(value.text());
				if (x > 1) {
					value.text(x - k);
				}
			});
		}
	}

	/* 

	6. Init Star Rating

	*/

	function initStarRating() {
		if ($('.user_star_rating ul li').length) {
			var stars = $('.user_star_rating ul li');

			stars.each(function () {
				var star = $(this);

				star.on('click', function () {
					var i = star.index();

					stars.find('i').each(function () {
						$(this).removeClass('fa-star');
						$(this).addClass('fa-star-o');
					});
					for (var x = 0; x <= i; x++) {
						$(stars[x]).find('i').removeClass('fa-star-o');
						$(stars[x]).find('i').addClass('fa-star');
					};
					$('#rate2').val(i + 1);
				});
			});
		}
	}

	/* 

	7. Init Favorite

	*/

	function initFavorite() {
		if ($('.product_favorite').length) {
			var fav = $('.product_favorite');

			fav.on('click', function () {
				fav.toggleClass('active');
			});
		}
	}

	/* 

	8. Init Tabs

	*/

	function initTabs() {
		if ($('.tabs').length) {
			var tabs = $('.tabs li');
			var tabContainers = $('.tab_container');

			tabs.each(function () {
				var tab = $(this);
				var tab_id = tab.data('active-tab');

				tab.on('click', function () {
					if (!tab.hasClass('active')) {
						tabs.removeClass('active');
						tabContainers.removeClass('active');
						tab.addClass('active');
						$('#' + tab_id).addClass('active');
					}
				});
			});
		}
	}
});

$("#bid_form").submit(function (e) {
	e.preventDefault();
	if (tmpScore<0.8)
	{
		if (tmpScore>=0)
		Swal.fire({
			icon: 'warning',
			title: 'Your score ='+tmpScore*100+'%<80%',
			text: '',
			showConfirmButton: true,
			showCloseButton: true
		});
		else{
			alert("error");
		}
	}
	else
	if (parseInt($('#placebid_value').text()) <= parseInt($('#product_price').text())) {
		Swal.fire({
			icon: 'warning',
			title: 'Please bid again',
			showConfirmButton: true,
			showCloseButton: true
		});
	}
	else {
		Swal.fire({
			title: 'Are you sure?',
			text: "Price: " + $('#placebid_value').text(),
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Confirm'
		}).then((result) => {
			if (result.value) {
				Swal.fire({
					text: 'Bidding...',
					timer: 5000,
					timerProgressBar: true
				})
				$('#price').val($('#placebid_value').text());
				this.submit();
			}
		});
	}
});


$('#favoritePrd').on('submit', function (event) {
	event.preventDefault(); // Stop the form from causing a page refresh.
	if ($('#favoriteBtn').val() == 1) {
		Swal.fire({
			icon: 'info',
			title: 'This product already exists in your favorite products list',
			showConfirmButton: true,
			showCloseButton: true
		});
	}
	else {
		$('#favoriteBtn').attr("disabled", true);
		const tmpid = window.location.pathname.split('product/id=')[1];
		var data = {
			key: 'favorite'
		};
		$.ajax({
			url: 'http://localhost:3000/product/id=' + tmpid,
			data: data,
			method: 'POST'
		}).then(function (response) {
			if (response == 1) {
				Swal.fire({
					icon: 'success',
					title: 'Added to favorite product list!!!',
					showConfirmButton: false,
					timer: 2000
				});
				$("#favoriteBtn").removeClass("btn btn-light").addClass("btn btn-danger");
				$('#favoriteBtn').val(1);
			}
			$('#favoriteBtn').attr("disabled", false);
		}).catch(function (err) {
			$('#favoriteBtn').attr("disabled", false);
			console.error(err);
		});
	}
});


$('#review_form').on('submit', function (event) {
	event.preventDefault(); // Stop the form from causing a page refresh.
	$('#review_submit').attr("disabled", true);
	const tmpid = window.location.pathname.split('product/id=')[1];
	var data = {
		key: 'review',
		Rating: $('#rate2').val(),
		Comment: $('#review_message').val()
	};

	$('#notify').append('Uploading...');
	$.ajax({
		url: 'http://localhost:3000/product/id=' + tmpid,
		data: data,
		method: 'POST'
	}).then(function (response) {
		const data = response;
		$('#notify').empty();
		Swal.fire({
			icon: 'success',
			title: 'Success',
			showConfirmButton: false,
			timer: 1500
		});
		/*ve rate*/
		var strTmp = '';
		var n = data.rateStar
		for (i = 0; i < 2 * n - 1; i += 2) {
			strTmp += '<li><i class="fa fa-star" aria-hidden="true"></i></li>';
		}
		if ((n * 2 - 1) % 2 == 0) {
			strTmp += '<li><i class="fa fa-star-half" aria-hidden="true"></i></li>';
			k = 2
		} else k = 0;
		for (i = n * 2; i < 10 - k; i += 2) {
			strTmp += ' <li><i class="fa fa-star-o" aria-hidden="true"></i></li>';
		}

		//hien thi thong tin vua review
		$('#insert').prepend(' <div class="user_review_container d-flex flex-column flex-sm-row">' +
			'	<div class="user">' +
			'<div class="user_pic">' +
			'<img src="/users/default/person_default_image.png" alt="' + data.name + '"' +
			'/>' +
			'</div>' +
			'<ul class="star_rating1">' +
			'<span class="stars">' + strTmp + ' </span>' +
			'	</ul>' +
			'</div>' +
			'	<div class="review">' +
			'<div class="review_date">' + data.TimePost + '</div>' +
			'<div class="user_name">' + data.name + '</div>' +
			'<p>' + data.comment + '</p>' +
			'	</div>' +
			'</div>');
		//tang so dem review len
		var counttmp = parseInt($('#countRev').text()) + 1;
		$('#countRev').html(counttmp);
		$('#countRev0').html(counttmp);
		//format form
		$("#review_message").val('');
		var stars = $('.user_star_rating ul li');
		stars.each(function () {
			stars.find('i').each(function () {
				$(this).removeClass('fa-star');
				$(this).addClass('fa-star-o');
			});
		});
		//kich hoat lai nut submit
		$('#review_submit').attr("disabled", false);
	}).catch(function (err) {
		console.error("error:" + err);
		$('#review_submit').attr("disabled", false);
		$('#notify').empty().append("falied");
	});
});

function notify1() {
	if (execute == false) {
		execute = true;
		Swal.fire({
			title: 'You are the highest bidder!!!',
			showConfirmButton: false,
			timer: 1500
		});
	}
}


$('#btnAutoBid').on('click', function (event) {
	event.preventDefault();
	Swal.fire({
		title: 'AUTOMATIC BIDDING',
		input: 'number',
		inputValue: parseInt($('#product_price').text()),
		text: 'Current bid:' + $('#product_price').text() + '  ; Price step:' + $('#priceStep').val(),
		inputAttributes: {
			maxlength: '10',
			min: parseInt($('#product_price').text()) + parseInt($('#priceStep').val()),
			step: $('#priceStep').val()
		},
		showCancelButton: true,
		confirmButtonText: 'Confirm',
		showLoaderOnConfirm: true
	}).then((result) => {
		if (result.value) {
			$('#PriceAuto').val(result.value);
			$('#AutoBid').submit();
		}
	})
});

