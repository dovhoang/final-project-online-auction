-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 04, 2020 at 07:24 PM
-- Server version: 10.4.10-MariaDB
-- PHP Version: 7.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `local`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `get5RelatedProduct` (IN `tmpID` INT(11))  SELECT p1.ProductID,p1.ProductName,p1.CatID,p1.PricePurchase,p1.PriceStart,p1.CurrentBid,
(select concat("**** ",Users.Lastname) from Users WHERE p1.CurrentWinner=Users.UserID) as curWinner,
DATE_FORMAT(p1.TimePost,'%d/%m/%Y %H:%i:%s') as TimePost,
DATE_FORMAT(p1.TimeExp,'%M %d , %Y %H:%i:%s') as TimeExp,
(SELECT COUNT(*) FROM Bid WHERE Bid.ProID=p1.ProductID) as CountBid
FROM Product p1
JOIN Categories cat1 on cat1.CatID=p1.CatID
WHERE cat1.ParentID=
(select cat2.ParentID from Categories cat2
join Product p2 on p2.CatID=cat2.CatID
where p2.ProductID=tmpID LIMIT 1)
AND p1.ProductID <> tmpID AND p1.TimeExp> NOW()
ORDER BY RAND()
LIMIT 5$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getCurrentWinner` (IN `proIDtmp` INT(11))  select CurrentBid,userID,concat("**** ",Lastname) as curWinnerName,Email, 
  (case when (ratingup<>0 OR ratingdown<>0) then floor((ratingup/(Ratingup+Ratingdown)*5) * 2  + 0.5) / 2  else 0 end) as rateStar
  from Product,Users where Product.CurrentWinner= Users.UserID and Product.ProductID = proIDtmp limit 1$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getFavoriteProduct` (IN `tmpid` INT)  Select fv.ProductID,fv.UserID,prd.ProductName
	,u.Username,prd.CurrentBid,DATE_FORMAT(prd.TimeExp,'%d/%m/%Y %H:%i:%s') as TimeExp
 	from Favorite fv 
	 					join Product prd on prd.ProductID=fv.ProductID
						join Users u on u.UserID=fv.UserID
	where fv.UserID=tmpid$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getFullInfoProductByCatID` (IN `catId` INT, IN `poffset` INT, IN `plimit` INT)  SELECT p3.ProductID, p3.ProductName, p3.PriceStart,p3.PricePurchase,
p3.TimeExp, p2.NumBid,p3.CurrentWinner, concat(u.FirstName," ", u.LastName) as WinnerName
FROM
(SELECT p1.ProductID, p1.CurrentWinner, COUNT(b.BidID) as NumBid
FROM Bid b RIGHT JOIN Product p1
ON b.ProID = p1.ProductID
GROUP BY p1.ProductID,p1.CurrentWinner) p2,
Users u, Product p3
WHERE u.UserID = p2.CurrentWinner AND p2.ProductID = p3.ProductID AND p3.CatID = catId AND p3.TimeExp > NOW()
LIMIT plimit OFFSET poffset$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getInfo3TimesLatestPrice` (IN `proIDtmp` INT(11))  select b.BidID,b.ProID,DATE_FORMAT(b.Time,'%d/%m/%Y %H:%i:%s') as time,b.UserID,b.Amount,concat("**** ",u.lastname) as name ,
(case when (u.ratingup<>0 OR u.ratingdown<>0) then floor((u.ratingup/(u.ratingup+u.ratingdown)*5) * 2  + 0.5) / 2  else 0 end) as rateStar
from Bid b,Product prd,Users u
where prd.ProductID=b.ProId and u.UserID=b.UserID and prd.ProductID=ProIDtmp 
ORDER by b.Amount DESC 
LIMIT 3$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getProductRecently` (IN `useridTmp` INT)  select distinct b.UserID,prd.ProductID,prd.ProductName,	DATE_FORMAT(prd.TimeExp,'%d/%m/%Y %H:%i:%s') as Time,
prd.CurrentBid ,u.UserID as idWinner,
(case when (u.UserID!=useridTmp) then concat('*******',u.LastName)
	else  concat(u.FirstName,u.LastName) end) as NameWinner,
	(case when (u.UserID!=useridTmp) then false
	else true end) as isWinner
	 
from Product prd
						join Bid b on b.ProID=prd.ProductID and b.UserID=useridTmp
						join Users u on prd.CurrentWinner=u.UserID
where UNIX_TIMESTAMP(NOW())-UNIX_TIMESTAMP(prd.TimeExp)<0
order by Time$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getReview` (IN `tmpid` INT)  select Review.ReviewID,DATE_FORMAT(Review.TimePost,'%d/%m/%Y %H:%i:%s') as TimePost, Review.userID,
concat(Users.firstname,Users.lastname) as name,
Review.Rating as rateStar,Review.comment,(select count(*) from Review where ProductID=tmpid) as CountRevByID
from Review ,Product ,Users 
where Review.ProductID=Product.ProductID and Product.ProductID=tmpid and 
Users.UserID=Review.userID
order by TimePost desc
limit 5$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getSellerInfo` (IN `tmpProductID` INT(11))  select UserID,concat("**** ",lastname) as sellerName,email,Username,
   (case when (ratingup<>0 OR ratingdown<>0) then floor((ratingup/(ratingup+ratingdown)*5) * 2  + 0.5) / 2  else 0 end) as rateStar
   from Product,Users where Product.SellerID=Users.UserID and Product.ProductID =tmpProductID  limit 1$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getSingleProduct` (IN `tmpid` INT)  NO SQL
select ProductID,ProductName,Product.CatID,Categories.CatName,PriceStart,PricePurchase,
PriceStep,CurrentBid,DATE_FORMAT(TimePost,'%d/%m/%Y %H:%i:%s') as TimePost,
DATE_FORMAT(TimeExp,'%m %d , %Y %H:%i:%s') as TimeExp,Product.description
from Product,Categories 
where ProductID =tmpid and Categories.CatID=Product.CatID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getTop5PopularBid` ()  SELECT p1.ProductID, p1.ProductName, p1.PriceStart,p1.PricePurchase,
p1.TimeExp, p2.NumBid,p1.CurrentWinner, concat("****"," ", u.LastName) as WinnerName
FROM Product p1,
(SELECT b.ProID, COUNT(b.BidID) as NumBid
FROM Bid b
GROUP BY b.ProID) p2,
Users u
WHERE p1.ProductID = p2.ProID AND u.UserID = p1.CurrentWinner
ORDER BY p2.NumBid DESC
LIMIT 5$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getTop5Price` ()  SELECT p3.ProductID, p3.ProductName, p3.PriceStart,p3.PricePurchase,
p3.TimeExp, p2.NumBid,p3.CurrentWinner, concat("****"," ", u.LastName) as WinnerName
FROM
(SELECT p1.ProductID, p1.CurrentWinner, COUNT(b.BidID) as NumBid
FROM Bid b RIGHT JOIN Product p1
ON b.ProID = p1.ProductID
GROUP BY p1.ProductID,p1.CurrentWinner) p2,
Users u, Product p3
WHERE u.UserID = p2.CurrentWinner AND p2.ProductID = p3.ProductID
AND p3.TimeExp > NOW()
ORDER BY p3.PriceStart DESC
LIMIT 5$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `getTop5ToEnd` ()  SELECT p3.ProductID, p3.ProductName, p3.PriceStart,p3.PricePurchase,
p3.TimeExp, p2.NumBid,p3.CurrentWinner, concat("****"," ", u.LastName) as WinnerName
FROM
(SELECT p1.ProductID, p1.CurrentWinner, COUNT(b.BidID) as NumBid
FROM Bid b RIGHT JOIN Product p1
ON b.ProID = p1.ProductID
GROUP BY p1.ProductID,p1.CurrentWinner) p2,
Users u, Product p3
WHERE u.UserID = p2.CurrentWinner AND p2.ProductID = p3.ProductID
AND p3.TimeExp > NOW()
ORDER BY p3.TimeExp ASC
LIMIT 5$$

CREATE DEFINER=`` PROCEDURE `getWonProduct` (IN `tmpid` INT)  Select wp.ProductID,wp.Price,prd.ProductName,DATE_FORMAT(wp.`Time`,'%d/%m/%Y %H:%i:%s') as Time,
concat(u.FirstName+" ",u.LastName) as SellerName,u.Username,
(SELECT COUNT(*) FROM Bid WHERE Bid.ProID=prd.ProductID) as numOfAuc
 	from WonProduct wp
	 					join Product prd on prd.ProductID=wp.ProductID
						join Users u on prd.SellerID=u.UserID
		where wp.UserID=tmpid$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fAuction` (`proID_tmp` INT, `userID_tmp` INT, `price_tmp` INT) RETURNS INT(11) BEGIN
  DECLARE returnvalue int(11);
  DECLARE curPrice int(11);
  DECLARE autoBid_UserID int(11);
   DECLARE autoBid_Price int(11);
   DECLARE PriceStep int(11);
   DECLARE countAutoBid int(11);
   DECLARE dateTmp Datetime;
   #neu la nguoi ban thi k cho dau gia
   if EXISTS(select * from Product where Product.SellerID=userID_tmp and Product.ProductID=proID_tmp)
   	then RETURN 0; end if;
SET @@session.time_zone = "+07:00";
set dateTmp=(select TimeExp from Product where proID_tmp=ProductID);
  SET returnvalue = 0;
  if (TIMEDIFF(NOW(),dateTmp)>=0) then
  delete from AutoBid where ProductID=proID_tmp;
  return 0;
  end if;
  #BUOC GIA
	SET PriceStep=(select Product.PriceStep From Product where ProductID=proID_tmp);
	#GIA HIEN TAI
  SET curPrice=(select Product.CurrentBid from Product where  ProductID=proID_tmp);
  #KIEM TRA NEU GIA DANG DAU KHAC BUOC GIA THI HUY DAU GIA
  if (((price_tmp) mod PriceStep)<>0) then return 0; end if;
	#KIEM TRA THOI GIAN DAU GIA VA GIA NEU HOP LE THI DAU GIA
  if (price_tmp>curPrice and TIMEDIFF(NOW(),dateTmp)<0) then
    insert into Bid set BidID=null , ProId=proID_tmp ,UserID=userID_tmp,
	 Amount=price_tmp,`Time`=NOW();
    update Product set CurrentBid=price_tmp,CurrentWinner=userID_tmp
	  where ProductID=proID_tmp;
  	set returnvalue=1;
  	end if;
    delete  from AutoBid  where ProductID=proID_tmp and Price<=(select CurrentBid from Product where ProductID=proID_tmp);	
  	#TU DONG DAU GIA
  	set countAutoBid=(select count(*) from AutoBid a where a.Price>=price_tmp+PriceStep and a.ProductID=proID_tmp);
  	#if k co nguoi dau gia tu dong
  	if (countAutoBid=0) then return returnvalue; end if;
  	#neu co dung 1 nguoi dau gia tu dong thi + step
  	if (countAutoBid=1) then 
  		set autoBid_Price=price_tmp+PriceStep;
  		set autoBid_UserID=(select UserID from AutoBid where Price>=price_tmp+PriceStep and ProductID=proID_tmp limit 1);
	  end if; 
		if (countAutoBid>=1) then 
	#neu co lon hon 2 nguoi thi lay gia nguoi thu 2 + step, va lay user la nguoi co gia cao nhat
	  if (countAutoBid>1) then 
		set autoBid_Price=(select Price+PriceStep from AutoBid where Price>=price_tmp+PriceStep and ProductID=proID_tmp
		ORDER BY Price desc limit 1,1);
 		set autoBid_UserID=(select UserID from AutoBid  where Price>=price_tmp+PriceStep and ProductID=proID_tmp
		  ORDER BY Price  desc limit 0,1);
	  end if; 
		insert into Bid set BidID=null , ProId=proID_tmp ,UserID=autoBid_UserID,
	 Amount=autoBid_Price,`Time`=NOW();
    update Product set CurrentBid=autoBid_Price,CurrentWinner=autoBid_UserID
	  where ProductID=proID_tmp;
	end if;
	  #sau khi insert vao Bid thi xoa nhung nguoi co gia thap hon gia hien tai
	  delete  from AutoBid  where ProductID=proID_tmp and Price<=(select CurrentBid from Product where ProductID=proID_tmp);	  
	  
  RETURN returnvalue;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fAutoBid` (`productID_tmp` INT, `userID_tmp` INT, `price_tmp` INT) RETURNS INT(11) begin
declare curPrice int(11);
declare curUser int(11);
declare PriceStep int(11);
declare autoBid_Price int(11);
declare autoBid_UserID int(11);
SET @@session.time_zone = "+07:00";
    set curUser=(select Product.CurrentWinner From Product where ProductID=productID_tmp);
    set curPrice=(select CurrentBid From Product where ProductID=productID_tmp);
    SET PriceStep=(select Product.PriceStep From Product where ProductID=productID_tmp);
    #if buoc gia k hop le thi loai bo
    if (price_tmp mod (select PriceStep from Product where ProductID=productID_tmp)<>0) then return 0; end if;
    # if gia tu dong ra ma nho hon gia hien tai + buoc gia thi dung
    if (price_tmp<curPrice+PriceStep) then return 0; end if;
    #if user chua tu dong dau gia san pham nay
    if (exists(select * from AutoBid where userID_tmp=UserID and productID_tmp=ProductID)=0) then
        insert into AutoBid set UserID=userID_tmp,ProductID=productID_tmp,Price=price_tmp,Time=Now();
    else 
    #da tu dong dau gia san pham nay
        #cap gia tu dong dau gia
        update AutoBid set Price=price_tmp  where UserID=userID_tmp  and ProductID=productID_tmp;
    end if;


    if (curPrice + PriceStep <=price_tmp and curUser<>userID_tmp) then
        insert into Bid set BidID=null , ProId=productID_tmp ,UserID=userID_tmp,
         `Time`=NOW(),Amount=curPrice+PriceStep;
        update Product set CurrentBid=curPrice+PriceStep,CurrentWinner=userID_tmp
         where ProductID=productID_tmp;
    end if;
    
    if (select count(*) from AutoBid where Price>=curPrice+PriceStep and ProductID=productID_tmp)>1 then 
        set autoBid_Price=(select Price+PriceStep from AutoBid where Price>=curPrice+PriceStep and ProductID=productID_tmp
        ORDER BY Price desc limit 1,1);
        set autoBid_UserID=(select UserID from AutoBid  where Price>=curPrice+PriceStep and ProductID=productID_tmp
          ORDER BY Price  desc limit 0,1);

        insert into Bid set BidID=null , ProId=productID_tmp ,UserID=autoBid_UserID,
     Amount=autoBid_Price,`Time`=NOW();
    update Product set CurrentBid=autoBid_Price,CurrentWinner=autoBid_UserID
      where ProductID=productID_tmp;
      if autoBid_UserID=userID_tmp then return 0; else return 0; end if;
    delete from AutoBid where Price<autoBid_Price and ProductID=productID_tmp;
    end if; 
          
    return 1;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fInsertFavorite` (`proID_tmp` INT(11), `userID_tmp` INT(11)) RETURNS INT(11) NO SQL
begin   
	DECLARE returnvalue int(11);
  SET returnvalue = 0;
  if (proID_tmp <> all(select ProductID from Favorite where UserID=userID_tmp)) then
    insert into Favorite set  ProductID=proID_tmp ,UserID=userID_tmp;
  	set returnvalue=1;
  end if;
  RETURN returnvalue;
end$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fSellerBlockBidder` (`proID_tmp` INT, `userID_tmp` INT, `sellerID_tmp` INT) RETURNS INT(11) BEGIN
	if ((proID_tmp not in (select ProductID from Product)) or userID_tmp NOT IN (select UserID from Users) or
	 (select SellerID from Product where proID_tmp=ProductID)<>sellerID_tmp)
	then return 0;
	end if;
	if EXISTS(SELECT * from BlackList WHERE ProductID=proID_tmp and UserID=userID_tmp) 	then return 0; end if;
	insert into BlackList set ProductID=proID_tmp , UserID=userID_tmp, Time=Now(),SellerID=sellerID_tmp;
	return 1;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `autobid`
--

CREATE TABLE `autobid` (
  `UserID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `Time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `autobid`
--

INSERT INTO `autobid` (`UserID`, `ProductID`, `Price`, `Time`) VALUES
(10, 4, 3380, '2020-01-02 20:22:04');

-- --------------------------------------------------------

--
-- Table structure for table `bid`
--

CREATE TABLE `bid` (
  `BidID` int(11) NOT NULL,
  `ProID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Amount` int(11) NOT NULL,
  `Time` datetime NOT NULL,
  `Session` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `bid`
--

INSERT INTO `bid` (`BidID`, `ProID`, `UserID`, `Amount`, `Time`, `Session`) VALUES
(1, 1, 10, 100, '2019-12-17 07:26:17', 0),
(2, 1, 10, 111, '2019-12-17 11:26:32', 0),
(3, 1, 3, 200, '2019-12-18 00:00:00', 0),
(4, 2, 3, 200, '2019-12-17 07:26:17', 0),
(5, 2, 2, 211, '2019-12-17 11:26:32', 0),
(6, 2, 2, 300, '2019-12-16 00:00:00', 0),
(7, 3, 2, 1200, '2019-12-17 07:26:17', 0),
(8, 3, 3, 1211, '2019-12-18 11:26:32', 0),
(9, 3, 10, 1300, '2019-12-19 00:00:00', 0),
(10, 3, 10, 1500, '2019-12-19 00:00:00', 0),
(11, 3, 3, 1600, '2019-12-26 00:00:00', 0),
(12, 3, 3, 3000, '2019-12-26 00:00:00', 0),
(13, 3, 10, 3500, '2019-12-26 00:00:00', 0),
(14, 3, 10, 4500, '2019-12-26 08:32:05', 0),
(15, 3, 10, 4501, '2019-12-26 08:34:01', 0),
(16, 3, 10, 4502, '2019-12-26 08:35:08', 0),
(17, 3, 10, 4503, '2019-12-26 08:38:21', 0),
(18, 3, 10, 4505, '2019-12-26 08:41:26', 0),
(19, 3, 10, 4507, '2019-12-26 08:42:18', 0),
(20, 2, 10, 10000, '2019-12-26 10:16:06', 0),
(21, 2, 10, 10001, '2019-12-26 10:16:51', 0),
(22, 2, 10, 10021, '2019-12-26 10:23:45', 0),
(23, 2, 10, 10031, '2019-12-26 10:23:59', 0),
(24, 2, 10, 10046, '2019-12-26 10:24:34', 0),
(25, 2, 10, 10056, '2019-12-26 10:28:48', 0),
(26, 2, 10, 10071, '2019-12-26 10:29:13', 0),
(27, 2, 10, 10081, '2019-12-26 10:29:18', 0),
(28, 2, 10, 10121, '2019-12-26 10:40:31', 0),
(29, 2, 10, 10146, '2019-12-26 10:40:37', 0),
(30, 2, 10, 10161, '2019-12-26 10:40:50', 0),
(31, 2, 10, 10176, '2019-12-26 10:43:00', 0),
(32, 2, 3, 10201, '2019-12-26 10:44:10', 0),
(33, 2, 3, 10221, '2019-12-26 10:44:14', 0),
(34, 2, 3, 10236, '2019-12-26 10:45:42', 0),
(35, 1, 3, 800, '2019-12-26 10:50:07', 0),
(36, 1, 3, 805, '2019-12-26 10:50:20', 0),
(37, 1, 3, 810, '2019-12-26 10:54:06', 0),
(38, 1, 3, 820, '2019-12-26 10:56:35', 0),
(39, 3, 3, 4509, '2019-12-26 11:11:36', 0),
(40, 3, 3, 4515, '2019-12-26 11:11:50', 0),
(41, 3, 10, 4517, '2019-12-26 11:12:46', 0),
(42, 3, 3, 4521, '2019-12-26 11:13:09', 0),
(43, 2, 3, 10241, '2019-12-26 11:16:40', 0),
(44, 2, 3, 10251, '2019-12-26 21:09:49', 0),
(45, 2, 3, 10261, '2019-12-26 21:13:34', 0),
(46, 2, 3, 10276, '2019-12-26 21:18:59', 0),
(47, 2, 3, 10291, '2019-12-26 21:19:42', 0),
(48, 2, 3, 10306, '2019-12-26 21:20:27', 0),
(49, 2, 3, 10326, '2019-12-26 21:21:57', 0),
(50, 2, 10, 10341, '2019-12-26 21:24:18', 0),
(51, 2, 10, 10356, '2019-12-26 21:24:22', 0),
(52, 2, 10, 10371, '2019-12-26 21:25:39', 0),
(53, 3, 10, 4527, '2019-12-26 21:26:14', 0),
(54, 1, 10, 1010, '2019-12-27 06:52:17', 0),
(55, 1, 10, 1020, '2019-12-27 06:52:22', 0),
(56, 1, 10, 1035, '2019-12-27 06:52:30', 0),
(57, 1, 10, 1045, '2019-12-27 06:52:58', 0),
(58, 1, 10, 1060, '2019-12-27 06:53:12', 0),
(59, 1, 10, 1070, '2019-12-27 06:54:00', 0),
(60, 3, 10, 4533, '2019-12-27 09:29:14', 0),
(61, 2, 10, 10386, '2019-12-27 09:37:06', 0),
(62, 2, 10, 10406, '2019-12-27 09:41:54', 0),
(63, 2, 10, 10421, '2019-12-27 09:44:02', 0),
(64, 2, 10, 10446, '2019-12-27 09:44:38', 0),
(65, 2, 10, 10466, '2019-12-27 09:45:40', 0),
(66, 2, 10, 10481, '2019-12-27 09:46:10', 0),
(67, 2, 10, 10496, '2019-12-27 09:48:43', 0),
(68, 2, 10, 10511, '2019-12-27 09:49:34', 0),
(69, 2, 10, 10526, '2019-12-27 09:52:16', 0),
(70, 2, 10, 10546, '2019-12-27 09:52:52', 0),
(71, 2, 10, 10561, '2019-12-27 10:37:52', 0),
(72, 2, 10, 10576, '2019-12-27 10:48:21', 0),
(73, 2, 10, 10586, '2019-12-27 10:49:06', 0),
(74, 2, 10, 10616, '2019-12-27 10:49:52', 0),
(75, 2, 10, 10631, '2019-12-27 10:50:43', 0),
(76, 2, 3, 10656, '2019-12-27 11:39:53', 0),
(77, 2, 3, 10666, '2019-12-27 21:49:31', 0),
(78, 3, 10, 4537, '2019-12-27 21:53:18', 0),
(79, 1, 10, 1085, '2019-12-28 10:25:56', 0),
(80, 1, 10, 1105, '2019-12-28 10:26:00', 0),
(81, 1, 10, 1120, '2019-12-28 10:26:51', 0),
(82, 2, 10, 10681, '2019-12-28 10:26:59', 0),
(83, 2, 10, 10696, '2019-12-28 12:06:22', 0),
(84, 2, 10, 10721, '2019-12-28 12:06:56', 0),
(85, 2, 10, 10741, '2019-12-28 12:07:03', 0),
(86, 3, 10, 4545, '2019-12-28 12:24:03', 0),
(87, 3, 3, 4549, '2019-12-28 12:24:30', 0),
(88, 2, 10, 10756, '2019-12-28 20:19:20', 0),
(89, 2, 10, 10766, '2019-12-28 20:21:29', 0),
(90, 2, 10, 10771, '2019-12-28 20:26:29', 0),
(91, 2, 10, 10786, '2019-12-29 11:29:56', NULL),
(92, 2, 10, 10806, '2019-12-29 11:30:17', NULL),
(93, 8, 10, 2500, '2019-12-29 12:11:48', NULL),
(94, 4, 10, 2500, '2019-12-29 12:12:14', NULL),
(95, 2, 10, 10831, '2019-12-29 12:13:59', NULL),
(96, 2, 10, 10851, '2019-12-29 12:14:04', NULL),
(97, 3, 10, 4555, '2019-12-29 12:20:09', NULL),
(98, 5, 10, 540, '2019-12-29 13:10:28', NULL),
(99, 5, 10, 560, '2019-12-29 13:20:29', NULL),
(100, 5, 10, 585, '2019-12-29 13:34:38', NULL),
(101, 5, 10, 605, '2019-12-29 13:38:18', NULL),
(102, 5, 10, 615, '2019-12-29 13:38:48', NULL),
(103, 5, 10, 635, '2019-12-29 13:41:08', NULL),
(104, 5, 10, 655, '2019-12-29 14:08:15', NULL),
(105, 5, 10, 675, '2019-12-29 14:08:21', NULL),
(106, 5, 10, 680, '2019-12-29 14:10:15', NULL),
(107, 5, 10, 770, '2019-12-29 14:10:49', NULL),
(108, 5, 10, 990, '2019-12-29 14:10:58', NULL),
(109, 5, 10, 995, '2019-12-29 14:12:23', NULL),
(110, 5, 10, 1010, '2019-12-29 14:12:27', NULL),
(111, 5, 10, 1030, '2019-12-29 14:12:31', NULL),
(112, 5, 10, 11100, '2019-12-29 14:12:48', NULL),
(113, 5, 10, 999900, '2019-12-29 14:13:16', NULL),
(114, 5, 10, 999910, '2019-12-29 14:24:33', NULL),
(115, 5, 10, 999915, '2019-12-29 14:27:56', NULL),
(116, 5, 10, 999925, '2019-12-29 14:29:21', NULL),
(117, 5, 10, 999930, '2019-12-29 14:29:27', NULL),
(118, 5, 10, 999935, '2019-12-29 14:29:33', NULL),
(119, 5, 10, 999940, '2019-12-29 14:31:12', NULL),
(120, 5, 10, 999950, '2019-12-29 14:31:16', NULL),
(121, 5, 10, 999960, '2019-12-29 14:31:48', NULL),
(122, 2, 10, 10866, '2019-12-29 14:35:48', NULL),
(123, 2, 10, 10886, '2019-12-29 14:35:54', NULL),
(124, 2, 10, 10901, '2019-12-29 14:35:59', NULL),
(125, 2, 10, 10916, '2019-12-29 14:36:05', NULL),
(126, 2, 10, 10931, '2019-12-29 14:36:10', NULL),
(127, 2, 10, 10946, '2019-12-29 14:40:54', NULL),
(128, 2, 10, 10951, '2019-12-29 14:40:58', NULL),
(129, 5, 10, 999965, '2019-12-29 14:49:53', NULL),
(130, 5, 10, 999970, '2019-12-29 14:50:00', NULL),
(131, 5, 10, 999975, '2019-12-29 14:50:08', NULL),
(132, 5, 10, 999980, '2019-12-29 16:19:41', NULL),
(133, 2, 10, 10971, '2019-12-29 16:20:58', NULL),
(134, 5, 10, 999985, '2019-12-29 16:28:24', NULL),
(135, 5, 10, 999990, '2019-12-29 16:28:31', NULL),
(136, 5, 10, 999995, '2019-12-29 16:28:37', NULL),
(137, 5, 10, 1000000, '2019-12-29 16:41:18', NULL),
(138, 5, 10, 1000010, '2019-12-29 16:41:31', NULL),
(139, 5, 10, 1000015, '2019-12-29 16:41:38', NULL),
(140, 5, 10, 1000020, '2019-12-29 16:41:48', NULL),
(141, 5, 10, 1000045, '2019-12-29 16:41:55', NULL),
(142, 3, 10, 4561, '2019-12-29 16:51:25', NULL),
(143, 3, 10, 4567, '2019-12-29 16:51:29', NULL),
(144, 3, 10, 4571, '2019-12-29 16:51:33', NULL),
(145, 3, 10, 4579, '2019-12-29 16:51:40', NULL),
(146, 3, 10, 4591, '2019-12-29 16:52:37', NULL),
(147, 2, 10, 10976, '2019-12-29 16:53:39', NULL),
(148, 4, 10, 2530, '2019-12-29 17:02:56', NULL),
(149, 4, 10, 2580, '2019-12-29 17:03:22', NULL),
(150, 4, 10, 2600, '2019-12-29 17:03:37', NULL),
(151, 4, 10, 2610, '2019-12-29 17:03:42', NULL),
(152, 4, 10, 3300, '2019-12-29 17:07:07', NULL),
(153, 2, 10, 10986, '2019-12-29 17:23:33', NULL),
(154, 8, 10, 2504, '2019-12-30 00:09:46', NULL),
(155, 4, 10, 3320, '2019-12-30 00:13:04', NULL),
(156, 4, 10, 3330, '2019-12-30 00:15:07', NULL),
(157, 10, 10, 3, '2019-12-30 00:15:28', NULL),
(158, 10, 10, 30, '2019-12-30 00:16:04', NULL),
(159, 16, 10, 1, '2019-12-30 00:16:42', NULL),
(160, 16, 10, 2, '2019-12-30 00:16:48', NULL),
(161, 16, 10, 3, '2019-12-30 00:16:57', NULL),
(162, 16, 10, 4, '2019-12-30 00:17:05', NULL),
(163, 16, 10, 5, '2019-12-30 00:17:24', NULL),
(164, 2, 10, 10991, '2019-12-30 00:18:15', NULL),
(165, 2, 10, 11036, '2019-12-30 00:19:18', NULL),
(166, 2, 10, 11046, '2019-12-30 00:29:24', NULL),
(167, 5, 24, 1000055, '2019-12-30 00:33:02', NULL),
(168, 5, 24, 1000060, '2019-12-30 00:33:35', NULL),
(169, 10, 24, 33, '2019-12-30 00:34:01', NULL),
(170, 10, 24, 39, '2019-12-30 00:34:24', NULL),
(171, 10, 24, 45, '2019-12-30 00:34:49', NULL),
(173, 10, 10, 48, '2019-12-30 16:20:27', NULL),
(174, 1, 24, 1500, '2020-01-01 01:54:02', NULL),
(175, 1, 24, 1600, '2020-01-01 01:55:24', NULL),
(176, 1, 24, 1605, '2020-01-01 02:00:13', NULL),
(177, 1, 24, 1610, '2020-01-01 02:01:13', NULL),
(178, 16, 10, 6, '2020-01-01 02:14:52', NULL),
(179, 16, 10, 7, '2020-01-01 02:14:56', NULL),
(180, 2, 10, 11116, '2020-01-01 02:16:35', NULL),
(181, 10, 10, 54, '2020-01-01 13:05:50', NULL),
(182, 10, 10, 69, '2020-01-01 13:05:58', NULL),
(183, 1, 4, 1670, '2020-01-01 13:29:47', NULL),
(184, 1, 4, 1671, '2020-01-01 13:30:22', NULL),
(185, 1, 4, 1672, '2020-01-01 13:30:38', NULL),
(186, 1, 4, 1700, '2020-01-01 13:31:04', NULL),
(187, 1, 4, 1705, '2020-01-01 13:34:54', NULL),
(188, 1, 4, 1800, '2020-01-01 13:36:05', NULL),
(189, 1, 24, 2305, '2020-01-01 13:36:05', NULL),
(190, 1, 4, 2310, '2020-01-01 13:36:49', NULL),
(191, 1, 24, 2315, '2020-01-01 13:36:49', NULL),
(192, 1, 24, 2320, '2020-01-01 13:50:34', NULL),
(193, 10, 10, 72, '2020-01-01 14:01:29', NULL),
(196, 1, 4, 2325, '2020-01-01 14:05:59', NULL),
(197, 1, 24, 2605, '2020-01-01 14:05:59', NULL),
(198, 1, 4, 2610, '2020-01-01 14:07:41', NULL),
(199, 1, 4, 2705, '2020-01-01 14:07:41', NULL),
(200, 1, 4, 2710, '2020-01-01 14:09:55', NULL),
(201, 1, 4, 2715, '2020-01-01 14:10:45', NULL),
(202, 1, 24, 2720, '2020-01-01 14:10:45', NULL),
(203, 1, 24, 2805, '2020-01-01 14:10:45', NULL),
(204, 1, 23, 2810, '2020-01-01 14:10:46', NULL),
(205, 1, 23, 2905, '2020-01-01 14:10:46', NULL),
(206, 1, 3, 2910, '2020-01-01 14:10:46', NULL),
(207, 1, 3, 3005, '2020-01-01 14:10:46', NULL),
(208, 1, 3, 3010, '2020-01-01 14:13:58', NULL),
(209, 1, 3, 3015, '2020-01-01 14:23:32', NULL),
(210, 1, 4, 3020, '2020-01-01 14:24:57', NULL),
(211, 1, 4, 3105, '2020-01-01 14:24:57', NULL),
(212, 1, 3, 3110, '2020-01-01 14:27:44', NULL),
(213, 1, 4, 3125, '2020-01-01 14:28:19', NULL),
(215, 1, 3, 3130, '2020-01-01 14:29:35', NULL),
(216, 1, 4, 3135, '2020-01-01 14:29:35', NULL),
(217, 1, 10, 3140, '2020-01-01 14:39:23', NULL),
(218, 1, 4, 3145, '2020-01-01 14:39:23', NULL),
(219, 10, 3, 75, '2020-01-01 14:42:38', NULL),
(220, 10, 10, 78, '2020-01-01 14:42:38', NULL),
(221, 10, 3, 81, '2020-01-01 14:42:46', NULL),
(222, 10, 3, 84, '2020-01-01 14:44:57', NULL),
(223, 6, 3, 445, '2020-01-01 19:33:01', NULL),
(224, 6, 3, 480, '2020-01-01 19:34:37', NULL),
(225, 6, 10, 485, '2020-01-01 19:41:42', NULL),
(226, 6, 3, 490, '2020-01-01 19:41:42', NULL),
(227, 6, 10, 495, '2020-01-01 19:41:50', NULL),
(228, 6, 3, 500, '2020-01-01 19:41:50', NULL),
(229, 6, 3, 490, '2020-01-01 19:41:57', NULL),
(230, 6, 10, 505, '2020-01-01 19:42:37', NULL),
(231, 6, 3, 510, '2020-01-01 19:42:48', NULL),
(232, 6, 10, 515, '2020-01-01 19:44:28', NULL),
(233, 6, 10, 530, '2020-01-01 19:44:28', NULL),
(234, 6, 10, 530, '2020-01-01 19:44:41', NULL),
(235, 6, 3, 535, '2020-01-01 19:47:03', NULL),
(236, 6, 10, 540, '2020-01-01 19:48:06', NULL),
(237, 6, 3, 565, '2020-01-01 20:14:48', NULL),
(238, 6, 10, 570, '2020-01-01 20:20:49', NULL),
(239, 6, 10, 575, '2020-01-01 21:46:46', NULL),
(242, 19, 29, 150, '2020-01-02 09:58:59', NULL),
(243, 10, 27, 90, '2020-01-02 12:30:08', NULL),
(244, 4, 10, 3340, '2020-01-02 20:21:58', NULL),
(245, 10, 10, 93, '2020-01-02 20:50:50', NULL),
(246, 10, 24, 96, '2020-01-03 00:09:30', NULL),
(247, 10, 10, 99, '2020-01-03 00:09:30', NULL),
(248, 10, 24, 102, '2020-01-03 00:09:39', NULL),
(249, 10, 10, 105, '2020-01-03 00:15:08', NULL),
(250, 10, 24, 108, '2020-01-03 00:17:15', NULL),
(251, 10, 10, 111, '2020-01-03 00:17:15', NULL),
(252, 10, 24, 114, '2020-01-03 00:18:00', NULL),
(253, 10, 10, 117, '2020-01-03 00:18:00', NULL),
(254, 10, 24, 120, '2020-01-03 00:19:02', NULL),
(255, 10, 10, 123, '2020-01-03 00:19:02', NULL),
(256, 10, 24, 126, '2020-01-03 00:19:50', NULL),
(257, 10, 10, 129, '2020-01-03 00:20:19', NULL),
(258, 10, 10, 132, '2020-01-03 00:20:36', NULL),
(259, 10, 10, 135, '2020-01-03 00:22:36', NULL),
(260, 10, 24, 138, '2020-01-03 00:22:50', NULL),
(261, 10, 10, 141, '2020-01-03 00:23:07', NULL),
(262, 10, 10, 144, '2020-01-03 00:23:16', NULL),
(263, 10, 24, 147, '2020-01-03 00:23:35', NULL),
(264, 10, 10, 150, '2020-01-03 00:23:35', NULL),
(265, 10, 24, 153, '2020-01-03 00:23:44', NULL),
(266, 10, 10, 156, '2020-01-03 00:23:54', NULL),
(267, 10, 24, 162, '2020-01-03 00:24:03', NULL),
(268, 10, 10, 162, '2020-01-03 00:24:10', NULL),
(269, 10, 24, 171, '2020-01-03 00:24:41', NULL),
(270, 10, 10, 168, '2020-01-03 00:25:03', NULL),
(271, 10, 10, 177, '2020-01-03 00:35:39', NULL),
(272, 10, 24, 186, '2020-01-03 00:36:02', NULL),
(273, 10, 10, 189, '2020-01-03 00:36:19', NULL),
(274, 10, 10, 192, '2020-01-03 00:36:25', NULL),
(275, 10, 24, 195, '2020-01-03 00:36:29', NULL),
(276, 10, 10, 198, '2020-01-03 00:36:29', NULL),
(277, 10, 24, 201, '2020-01-03 00:36:32', NULL),
(278, 10, 10, 204, '2020-01-03 00:36:47', NULL),
(279, 10, 24, 207, '2020-01-03 00:37:28', NULL),
(280, 10, 10, 210, '2020-01-03 00:37:28', NULL),
(281, 16, 10, 8, '2020-01-04 23:17:29', NULL),
(282, 16, 30, 9, '2020-01-04 23:39:55', NULL),
(283, 8, 30, 2510, '2020-01-04 23:40:46', NULL),
(284, 16, 30, 10, '2020-01-04 23:56:59', NULL),
(285, 16, 30, 11, '2020-01-04 23:57:20', NULL),
(286, 16, 24, 12, '2020-01-05 00:00:02', NULL),
(287, 16, 30, 13, '2020-01-05 00:00:26', NULL),
(288, 16, 24, 14, '2020-01-05 00:00:34', NULL),
(289, 16, 30, 15, '2020-01-05 00:00:50', NULL),
(290, 16, 24, 16, '2020-01-05 00:00:50', NULL),
(291, 16, 30, 17, '2020-01-05 00:01:43', NULL),
(292, 16, 30, 18, '2020-01-05 00:02:46', NULL),
(293, 1, 10, 3150, '2020-01-05 00:20:32', NULL),
(294, 1, 10, 3160, '2020-01-05 00:20:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blacklist`
--

CREATE TABLE `blacklist` (
  `ProductID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `SellerID` int(11) DEFAULT NULL,
  `Time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `CatID` int(11) NOT NULL,
  `CatName` varchar(100) NOT NULL,
  `ParentID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`CatID`, `CatName`, `ParentID`) VALUES
(1, 'Technology', 0),
(2, 'Tablet', 1),
(3, 'Smartphone', 1),
(4, 'Camena', 1),
(5, 'Appliances', 0),
(6, 'Fan', 5),
(7, 'Washing machine', 5),
(8, 'Refrigerator', 5),
(9, 'Microwave', 5),
(10, 'Pump', 5),
(11, 'Fashion', 0),
(12, 'Men', 11),
(13, 'Women', 11),
(14, 'Famous brand', 11),
(15, 'Children', 11),
(16, 'Laptop', 1);

-- --------------------------------------------------------

--
-- Table structure for table `downgrade`
--

CREATE TABLE `downgrade` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `IsDown` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `downgrade`
--

INSERT INTO `downgrade` (`UserID`, `Username`, `IsDown`) VALUES
(10, 'hieuho122', 0),
(27, 'hien1', 0);

-- --------------------------------------------------------

--
-- Table structure for table `favorite`
--

CREATE TABLE `favorite` (
  `UserID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `favorite`
--

INSERT INTO `favorite` (`UserID`, `ProductID`) VALUES
(10, 1),
(10, 10),
(10, 16),
(24, 1),
(24, 10),
(24, 16),
(30, 1),
(30, 16);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(200) NOT NULL,
  `CatID` int(11) NOT NULL,
  `SellerID` int(11) NOT NULL,
  `PriceStart` int(11) NOT NULL,
  `PricePurchase` int(11) DEFAULT NULL,
  `PriceStep` int(11) NOT NULL,
  `CurrentWinner` int(11) DEFAULT NULL,
  `CurrentBid` int(11) NOT NULL,
  `TimePost` datetime NOT NULL,
  `TimeExp` datetime NOT NULL,
  `IsOver` tinyint(1) NOT NULL,
  `Description` varchar(2000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`ProductID`, `ProductName`, `CatID`, `SellerID`, `PriceStart`, `PricePurchase`, `PriceStep`, `CurrentWinner`, `CurrentBid`, `TimePost`, `TimeExp`, `IsOver`, `Description`) VALUES
(1, 'Dell Vostro 3578A', 16, 30, 700, 990, 5, 10, 3160, '2019-12-25 00:00:00', '2021-01-01 00:00:00', 0, 'Pre-installed with the latest 8th Gen Intel Core i5 8250U processor Coffee Lake up to 3.40GHz, Dell Vostro 3578A runs very fast and smoothly, can handle well at any task. The RAM available on the machine is advanced 4GB DDR4 and you can easily upgrade RAM at a cost savings through the second RAM slot. In particular, Dell Vostro 3578A also equipped discrete VGA AMD Radeon 520, optimized for graphics applications and many entertainment games for you.\r\n\r\nHard drive on Dell Vostro 3578A extremely large capacity 1TB, enough to store all the documents you need, maximum service for the job.'),
(2, 'Asus Zenbook UX333FA-A4046T', 16, 2, 800, 1100, 5, 10, 11116, '2019-12-26 00:00:00', '2020-01-02 00:00:00', 0, '413/5000\r\nAsus ZenBook 13 UX333FA is the beginning of a new era, the era of ultra-portable products. With a NanoEdge ultra-thin bezel on all four sides, the 13-inch ZenBook is about the size of a book despite having a standard 13.3-inch screen. In fact, the 13-inch ZenBook is smaller than the A4 sheet we\'ve ever seen and easily carried anywhere when the weight is only 1.09kg.'),
(3, 'Xiaomi Mi 9T 128GB', 3, 2, 390, NULL, 2, 10, 4591, '2019-12-27 00:00:00', '2020-01-03 00:00:00', 0, 'Screen: 6.39 inchs, Full HD +, 2340 x 1080 Pixel\r\nFront camera: 20.0 MP\r\nRear Camera: 48 MP, 13 MP +8 MP (3 cameras)\r\nRAM: 6 GB\r\nInternal memory: 128 GB\r\nCPU: Snap dragon 730, 8, 2.2Ghz\r\nGPU: Adreno 618\r\nBattery capacity: 4000 mAh\r\nOperating system: Android 9\r\nSIM Card: Nano SIM, 2 Sim'),
(4, 'Samsung Galaxy Fold', 3, 3, 2350, NULL, 10, 10, 3340, '2019-12-27 00:00:00', '2020-01-03 00:00:00', 0, 'Screen: Main 7.3, Super AMOLED, Full HD +, 2152 x 1536 Pixels\r\nFront camera: Inside: 10 MP, 8 MP; External: 10 MP\r\nRear Camera: Main 12 MP & Secondary 12 MP, 16 MP\r\nRAM: 12 GB\r\nInternal memory: 512 GB\r\nCPU: Snapdragon 855 8 cores, 8, 1 core 2.84 GHz, 3 cores 2.42 GHz & 4 cores\r\nGPU: Adreno 640\r\nBattery capacity: 4380 mAh\r\nOperating system: Android 9.0 (Pie)\r\nSIM Card: eSIM and NanoSIM, 1 Sim\r\nMade in Viet Nam\r\nYear of manufacture: 2019'),
(5, 'iPad 2019 10.2 Wi-Fi + 4G 32GB', 2, 3, 490, NULL, 5, 24, 1000060, '2019-12-25 00:00:00', '2019-12-31 00:00:00', 0, 'Screens: 10.2 inches, 2160 x 1620 Pixels\r\nFront camera: 1.2 MP\r\nRear camera: 8.0 MP\r\nCPU: A10 Fusion\r\nGPU: Updating\r\nRAM: 3 GB\r\nInternal memory: 32 GB\r\nConnectivity: Wi-Fi: 802.11 a / b / g / n / ac, Bluetooth: v4.2\r\nOperating system: iPadOS\r\nMade in China\r\nYear of manufacture: 2019'),
(6, 'Samsung Galaxy Tab A Plus 8.0', 2, 3, 350, 500, 5, 10, 575, '2019-12-26 00:00:00', '2020-01-04 00:00:00', 0, 'Screens: 8.0 inches, 1920 x 1200 pixels\r\nFront camera: 5.0 MP\r\nRear camera: 8.0 MP\r\nCPU: Exynos 7904\r\nGPU: G71 MP2\r\nRAM: 3 GB\r\nInternal memory: 32 GB\r\nConnectivity: Wi-Fi: Wi-Fi 802.11 b / g / n, Bluetooth: Bluetooth 4.2\r\nOperating system: Android 9.0 (Pie)\r\nMade in Viet Nam\r\nYear of manufacture: 2019'),
(7, 'EOS M50 Kit (EF-M15-45 IS STM)', 4, 3, 900, 1200, 10, NULL, 0, '2019-12-26 00:00:00', '2020-01-11 00:00:00', 0, '24.1-megapixel APS-C CMOS sensor (featured by improved Pixel Cmos dual-AF technology)\r\nDIGIC 8 image processor, ISO supported from 100 - 25600 (expandable up to 51200)\r\n0.39 type OLED electronic viewfinder, approx. 2.36 million pixels\r\nShoot movies in 4K resolution, with an aspect ratio of 23.98p / 25p\r\n5-axis image stabilization technology during movie recording (combined stabilization)'),
(8, 'CANON IXUS 185', 4, 3, 100, NULL, 2, 30, 2510, '2019-12-28 00:00:00', '2020-01-23 00:00:00', 0, '20 megapixel CCD sensor\r\n- Digic 4+ image processor\r\n- 2.7inch screen\r\n- 8x optical zoom (28 - 224mm) with ZoomPlus 16x\r\n- ISO speed 100-800\r\n- Shutter speed 15 - 1/2000 seconds\r\n- HD video recording\r\n- NB-11LH compatible battery\r\n- Weight 111g'),
(9, 'Fan ASIA D16026 Black', 6, 3, 20, NULL, 1, NULL, 0, '2019-12-27 00:00:00', '2020-01-17 00:00:00', 0, 'Capacity: 55W\r\nWind flow: 85m3 / minute\r\n3 speed, 40cm wingspan\r\nControl buttons'),
(10, 'Fan ASIA A16019 Blue', 6, 3, 32, NULL, 3, 10, 210, '2019-12-26 00:00:00', '2020-01-10 00:00:00', 0, 'Speed: 3 Capacity: 45W Wind flow: 63.5 m3 / min Number of wings: 3 wings Wingspan: 40cm'),
(11, 'Bosch VSG.SMS46MI05E', 7, 3, 1100, 1400, 20, NULL, 0, '2019-12-27 00:00:00', '2019-01-23 00:00:00', 0, 'Product code Bosch SMS46MI05E\r\nIndependent dishwasher style\r\nMade in Bosch - Germany\r\nProduct type Bosch dishwashers\r\nA ++ energy label 0.92kWh\r\nWater consumption (liters) 9.5 L\r\nWash capacity 14 sets\r\nWashing program 06 programs\r\nSpill prevention mode Yes\r\nHot water wash mode Yes\r\nTime setting Yes, up to 24 hours\r\nAquaStop system prevents water leakage Yes\r\nAqua-Sensor load sensing system Yes\r\nPower 2400 W\r\nNoise level (dB) 42 dB\r\nDimensions 845 '),
(12, 'Bosch SMI88TS36E', 7, 3, 1400, 1600, 5, NULL, 0, '2019-12-27 00:00:00', '2020-01-16 00:00:00', 0, 'Product code Bosch SMI88TS36E\r\nMade in Germany\r\nWash capacity 13 (sets)\r\nA +++ energy label (-10%) Save more than 10% (211 kWh / year) compared to the limit (235 kWh / year) for A +++ energy labels\r\nNoise level 40 (dB)\r\nElectricity consumption in the Eco program 0.73 (kWh)\r\nElectricity consumption in Eco (year) 211 (kWh)\r\nWater consumption in the Eco 7.5 program (liters)\r\nWater consumption in Eco (year) 2100 (liter)\r\nOff mode 0.5 (W)\r\nProgram duration Eco 225 minutes\r\nDrying effect A\r\nMain Program 8 (Auto 35 '),
(13, 'Aqua 204L AQR-I227BN (DC)', 8, 3, 250, 400, 5, NULL, 0, '2019-12-28 00:00:00', '2020-01-23 00:00:00', 0, 'Capacity of 204 liters is suitable for families of 3-6 people.\r\nMulti Flow multi-dimensional cooling technology helps food to be cooled faster.\r\nInverter technology helps the cabinet operate smoothly, save electricity effectively, help food fresh for a long time.\r\n-3 '),
(14, 'HITACHI Inverter 540 Lít R-FW690PGV7X(GBK)', 8, 3, 1345, 1560, 10, NULL, 0, '2019-12-26 00:00:00', '2020-01-24 00:00:00', 0, 'Volumn : 540 lit\r\nInverter power saving technology\r\nAdjust the temperature manually\r\nQuick cooling Yes\r\nGet the ice outside\r\nCapacity Over 450 liters\r\nGet foreign Yes\r\nAutomatic ice making Yes\r\nOther Features Take external water, Nani Titanium filter Touch panel, Alarm'),
(15, 'JACKET M1AKD129001', 12, 3, 10, NULL, 1, NULL, 0, '2019-12-27 00:00:00', '2020-01-17 00:00:00', 0, 'Material: umbrella fabric\r\nSize: L\r\nColor: blue-black'),
(16, 'Unisex baggy pants', 13, 3, 15, NULL, 1, 30, 18, '2019-12-27 00:00:00', '2020-01-16 00:00:00', 0, 'Comfortable trousers kate fabric \r\n\r\nElastic band suitable for all sizes of round 2\r\nYouthful and modern form\r\nSuitable for both men and women\r\n\r\nSuitable for school, outing,'),
(17, 'VEST 4F8001CT2/C22', 14, 3, 250, 350, 5, NULL, 0, '2019-12-27 00:00:00', '2020-01-17 00:00:00', 0, 'Ingredients: 50% POLY - 50% WOOL\r\nPattern: READING'),
(19, 'Laptop Dell', 16, 27, 100, 2000, 50, 29, 150, '2020-01-02 09:57:43', '2020-01-09 09:57:43', 0, '<b><i class=\"fa fa-edit\"></i> 2020-01-02 09:57:43</b><br><p><span style=\"text-decoration: underline;\"><em><strong>abcdef</strong></em></span></p>'),
(20, 'SAN PHAM TEST', 14, 10, 100, 0, 5, NULL, 0, '2020-01-05 00:12:01', '2020-01-12 00:12:01', 0, '<b><i class=\"fa fa-edit\"></i> 2020-01-05 00:12:01</b><br><p>-Test xem sản phẩm m&igrave;nh đăng th&igrave; c&oacute; đấu gi&aacute; được kh&ocirc;ng.</p>'),
(21, 'SAN PHAM TEST', 14, 10, 100, 0, 5, NULL, 0, '2020-01-05 00:13:00', '2020-01-12 00:13:00', 0, '<b><i class=\"fa fa-edit\"></i> 2020-01-05 00:13:00</b><br><p>-Test xem sản phẩm m&igrave;nh đăng th&igrave; c&oacute; đấu gi&aacute; được kh&ocirc;ng.</p>'),
(22, 'SAN PHAM TEST', 14, 10, 100, 1000000, 5, NULL, 0, '2020-01-05 00:15:11', '2020-01-12 00:15:11', 0, '<b><i class=\"fa fa-edit\"></i> 2020-01-05 00:15:11</b><br><p>-Test xem sản phẩm m&igrave;nh đăng th&igrave; c&oacute; đấu gi&aacute; được kh&ocirc;ng.</p>'),
(23, 'SAN PHAM TEST', 14, 10, 100, 1000000, 5, NULL, 0, '2020-01-05 00:16:31', '2020-01-12 00:16:31', 0, '<b><i class=\"fa fa-edit\"></i> 2020-01-05 00:16:31</b><br><p>-Test xem sản phẩm m&igrave;nh đăng th&igrave; c&oacute; đấu gi&aacute; được kh&ocirc;ng.</p>');

-- --------------------------------------------------------

--
-- Table structure for table `requestupdate`
--

CREATE TABLE `requestupdate` (
  `Username` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL,
  `IsRefuse` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `ReviewID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Rating` tinytext NOT NULL,
  `Comment` varchar(500) NOT NULL,
  `TimePost` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`ReviewID`, `ProductID`, `UserID`, `Rating`, `Comment`, `TimePost`) VALUES
(345, 4, 10, '3', 'asdasd', '2020-01-02 20:17:52'),
(346, 1, 30, '2', 'ádasd', '2020-01-05 00:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `reviewbidderseller`
--

CREATE TABLE `reviewbidderseller` (
  `revID` int(11) NOT NULL,
  `Rate` tinyint(1) NOT NULL,
  `Type` smallint(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `TargetID` int(11) NOT NULL,
  `Comment` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `Time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `reviewbidderseller`
--

INSERT INTO `reviewbidderseller` (`revID`, `Rate`, `Type`, `UserID`, `TargetID`, `Comment`, `Time`) VALUES
(28, 1, 0, 10, 2, 'asdasfasf', '2020-01-02 23:06:49'),
(29, 1, 0, 10, 3, 'asdakjsdasd 23123qdasd', '2020-01-02 23:13:50'),
(30, 1, 0, 10, 3, 'zasdasd', '2020-01-02 23:13:55'),
(31, 1, 0, 10, 3, 'asfasfasfasfasd', '2020-01-02 23:15:57'),
(32, 0, 0, 10, 3, 'asdasf', '2020-01-02 23:18:57'),
(33, 1, 0, 10, 3, 'asdasfasf eaeasdasd', '2020-01-02 23:32:12'),
(34, 0, 0, 10, 3, 'asdasfasfkajsfasf', '2020-01-02 23:32:42'),
(35, 1, 0, 10, 3, 'asdakjsdasd 23123qdasdasd asda sdasd', '2020-01-02 23:59:12'),
(36, 0, 0, 10, 3, 'gsdfdfassd asdasdbjashdg kasjdb ashbd jashdb jasd', '2020-01-02 23:59:55');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Password` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `FirstName` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `LastName` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `DOB` date DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Type` int(11) NOT NULL,
  `CityProvince` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `District` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Ward` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Street` varchar(150) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `RatingUp` int(11) NOT NULL DEFAULT 0,
  `RatingDown` int(11) NOT NULL DEFAULT 0,
  `TimeCreate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `FirstName`, `LastName`, `DOB`, `Email`, `Type`, `CityProvince`, `District`, `Ward`, `Street`, `RatingUp`, `RatingDown`, `TimeCreate`) VALUES
(2, 'hienadmin', '$2a$10$j3AztP3WgyzDGPdq807LCebQvjxFn1ikwK7D8XP3HgU2ZplZxlw9K', '0', '0', '2019-12-01', 'hienadmin@gmail.com', 2, 'hienadmin', 'hienadmin', 'hienadmin', 'hienadmin', 8, 2, '0000-00-00'),
(3, 'hieuadmin', '$2a$10$f6tpOix.hbVoSAr4HbwYBe55ktQPJHQeVOeECUSGzaZl6YCQc1OGu', '0', '0', '2019-12-01', 'hieuadmin@gmail.com', 2, 'hieuadmin', 'hieuadmin', 'hieuadmin', 'hieuadmin', 5, 3, '0000-00-00'),
(4, 'hoangadmin', '$2a$10$VOW89k55XvMmcfeO3OKUDuxDRLIzFanEQ52v3Ni/lkjwlBBObB/K6', '0', '0', '2019-12-01', 'hoangadmin@gmail.com', 2, 'hoangadmin', 'hoangadmin', 'hoangadmin', 'hoangadmin', 0, 0, '0000-00-00'),
(10, 'hieuho122', '$2a$10$08/7jP3PQbt/U0dOvfFKyuwXSirzqFah1J3q/Kkr1gYtXiGH6lCGO', 'hieu', 'ho', '2019-12-09', 'hieuqqq12597@gmail.com', 1, 'hcm', '123', '123', '123', 8, 2, '0000-00-00'),
(22, 'xiaomiofficalstore', '$2a$10$gDGEKEcA5Svil1/KWQUZ4utnXy/LsL/xf2Eb/5sFp8U9.0n/b42fi', 'Xiaomi Offical ', 'Store', '1999-01-01', 'viethoang.ab1@gmail.com', 1, 'TP Hồ Chí Minh', '10', '1', '333 Lê Hồng Phong', 0, 0, '0000-00-00'),
(23, 'viethoang', '$2a$10$tlD.4YTbTOcy9N843fPQSOW/Lv7swL6yUQxHFYzDMA9Hl.EyEF.Be', 'Do Viet', 'Hoang', '1999-03-09', 'viethoang.hcmus@gmail.com', 0, 'TP Hồ Chí Minh', '10', '15', '99 Lý Thường Kiệt', 0, 0, '0000-00-00'),
(24, 'hieuho123', '$2a$10$ddPuXi1G8GkdfC/qS2YiGefgH0cCY8tODyLcJvvAc64ueOh01w1tu', '(-_-)', '(^_6)', '2019-12-17', 'hieuqqq12589@gmail.com', 0, 'Quận 10', '7', 'ajksd', 'N/A', 0, 0, '0000-00-00'),
(27, 'hien1', '$2a$10$tRrOyF1Cfm4AMAktgf3G9ORk1rxyBFADbHiIKgqdYgDhJUVeIV.fy', 'hien1', 'hien1', '2020-01-03', 'thachdau16t@gmail.com', 1, 'hien1', 'hien1', 'hien1', 'hien1', 0, 0, '0000-00-00'),
(29, 'hien2', '$2a$10$FDcYOa5ABNvoVQoqjVjjvea9pMEWvxtDnbF.kohl9O3gvrtvT.O3i', 'hien2', 'hien2', '2019-12-29', 'thachdau18t@gmail.com', 0, 'hien2', 'hien2', 'hien2', 'hien2', 0, 0, '0000-00-00'),
(30, 'hieuho124', '$2a$10$EGq.6h1cx65/9wIpQHHlVuL5b/bjs0S5BzATf7yrj3siHnYk274Jq', 'hieu', 'Ho', '2020-01-22', 'hieuqqq12596@gmail.com', 0, 'Quận 10', '7', '10', 'N/A', 0, 0, '0000-00-00');

-- --------------------------------------------------------

--
-- Table structure for table `wonproduct`
--

CREATE TABLE `wonproduct` (
  `WPID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `Time` datetime NOT NULL,
  `NumOfAuc` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `wonproduct`
--

INSERT INTO `wonproduct` (`WPID`, `UserID`, `ProductID`, `Price`, `Time`, `NumOfAuc`) VALUES
(2, 10, 10, 5000, '2020-01-02 20:45:45', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `autobid`
--
ALTER TABLE `autobid`
  ADD PRIMARY KEY (`UserID`,`ProductID`);

--
-- Indexes for table `bid`
--
ALTER TABLE `bid`
  ADD PRIMARY KEY (`BidID`),
  ADD KEY `FK_Bid_Product` (`ProID`),
  ADD KEY `FK_Bid_Users` (`UserID`);

--
-- Indexes for table `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`ProductID`,`UserID`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CatID`);

--
-- Indexes for table `downgrade`
--
ALTER TABLE `downgrade`
  ADD PRIMARY KEY (`UserID`);

--
-- Indexes for table `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`UserID`,`ProductID`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `requestupdate`
--
ALTER TABLE `requestupdate`
  ADD PRIMARY KEY (`UserID`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`ReviewID`);

--
-- Indexes for table `reviewbidderseller`
--
ALTER TABLE `reviewbidderseller`
  ADD PRIMARY KEY (`revID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- Indexes for table `wonproduct`
--
ALTER TABLE `wonproduct`
  ADD PRIMARY KEY (`WPID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bid`
--
ALTER TABLE `bid`
  MODIFY `BidID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=295;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `CatID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=347;

--
-- AUTO_INCREMENT for table `reviewbidderseller`
--
ALTER TABLE `reviewbidderseller`
  MODIFY `revID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `wonproduct`
--
ALTER TABLE `wonproduct`
  MODIFY `WPID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bid`
--
ALTER TABLE `bid`
  ADD CONSTRAINT `FK_Bid_Product` FOREIGN KEY (`ProID`) REFERENCES `product` (`ProductID`),
  ADD CONSTRAINT `FK_Bid_Users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
