var _mediaId = "";
var _stopTime = 0;	//センテンス単位で再生開始した場合の終了時間を保持
var _timeCounterArray = "";
var video = null;

$(function ()
{
	try{
		_mediaId = "dialogVideoCtrl";
		_targetLang = "";
		_functionNo = "01";

	<!-- 2016/03/25 メキシコのスペイン語のみ必要なJS 隔離場所がないので置いてある -->
	$("button.discView").click(function(){
		$(this).next().toggle();
		$(this).toggle();
		$(this).parent().next().toggle();
	})
	$("button.discHidden").click(function(){
		$(this).prev().toggle();
		$(this).toggle();
		$(this).parent().next().toggle();
	})

		/****************** テスト：開始 ******************/
		$(".changeTitle .selectTitle").change(
			function()
			{
				//dmod/index.htmlで、場面を選択する前の値。一度場面を選択後、ブラウザバックで戻ると、この値が選択できる状態になっている。
				//これを選択してもlocation.hrefが発生しないようにする。
				if($(this).val() != "---"){
					window.location.href = $(this).val();
				}
			}
		)
		//index.html以外のページ設定
		if(typeof _learningProgram !== 'undefined'){
			changeContentsHeight();
			
			//画面のリサイズが終わった段階で、コンテンツのサイズを修正する。
			var resizeTimer = false;
			$(window).resize(function() {
				$("#textScroll").css("display","none");
				if (resizeTimer !== false) {
					clearTimeout(resizeTimer);
				}
				resizeTimer = setTimeout(function() {
					resizeContentsSize()
				}, 200);
			});
	
			//パターンを選択したら、コンテンツのサイズを修正する
			$(".changeTitle .selectType").change(changeType);
			
			//動画再生時に文字をスクロール"する/しない"の切り替えボタン
			$('#textScroll').click(
			function(){
				$(this).toggleClass('buttonoff');
			})
		}
		
		else{	//index.htmlのコンテンツサイズ変更(これをしない場合はFooterがかなり上の方に表示されてしまう:特に解説文章が何もない場合は不自然な画面になる)
			var resizeTimer = false;
			
			//ページ読み込み終了後
			$(window).load(resizeIndexSize);

			//画面のリサイズが終わった段階で、コンテンツのサイズを修正する。
			$(window).resize(function() {
				if (resizeTimer !== false) {
					clearTimeout(resizeTimer);
				}
				resizeTimer = setTimeout(resizeIndexSize, 200);
			});
			
			//表示用の言語が二種類あった場合、言語を変えるボタンを押したら表示を変更する
			$('.toggle_lang').click(changeMenuLang);
			$('.disp-ja-page').click(changeLang);
			$('.disp-en-page').click(changeLang);
		}
		/****************** テスト：終了 ******************/
		
		$('#targetLangButton').click(dispTargetToggle);			//学習言語の表示/非表示ボタン動作設定
		$('#ownLangButton').click(dispOwnToggle);				//学習者の言語の表示/非表示ボタン動作設定
		$('#pronButton').click(dispPronToggle);					//発音の表示/非表示ボタン動作設定
		$('#vocabularyButton').click(dispVocabularyToggle);		//語彙の表示/非表示ボタン動作設定
		$('#dispSituation').click(toggleSituation);				//状況の表示/非表示ボタン動作設定
		$('#situationTxtDiv').click(toggleSituation);			//状況の表示/非表示ボタン動作設定
		$('.pro_inline').click(openPatterns);					//クリックされた機能のパターンの開閉コントロール　例)"挨拶する"をクリック→パターン1からパターン4を表示
		partButtons = $('button.dispPartButton');
		for(i=0; i<partButtons.length; i++){
			$(partButtons[i]).click(dispTogglePart);
		}
		
		//sentence表示/非表示のcontrol設定
		sentence = $('div.stDiv');
		for(i=0; i<sentence.length; i++){
			checkButton = $(sentence[i]).find('input');
			sentenceText = $(sentence[i]).find('div.stDataDiv');
			$(checkButton).click(sentenceToggle);
		}
	
		//sentenceをクリックした時の動画再生アクションを追加
		sentence = $('div.stDataDiv');
		for(i=0; i<sentence.length; i++){
			$($(sentence[i])).click(playSentence);
		}
	
		//lineのimageをクリックした時の動画再生アクションを追加
		lines = $('div.lineImg');
		for(i=0; i<lines.length; i++){
			$($(lines[i])).click(playLine);
		}

		video = document.getElementById(_mediaId);

		if(video !== null)
		{
			$('#video_start').click(videoStart);
			$('#video_pause').click(videoPause);
			$('#video_stop').click(videoStop);
			
			var moviePath = "movie/" + _targetLang + _functionNo;
			var vs = document.createElement("source");
			vs.setAttribute("src", moviePath + ".mp4");
			video.appendChild(vs);
			vs = document.createElement("source");
			vs.setAttribute("src", moviePath + ".webm");
			video.appendChild(vs);
		
	
			video.addEventListener("pause", function()
			{
				resetLineCss();
				_timeCounterArray = _timeCounterStArray;
			},false);
			video.addEventListener("timeupdate", function ()
			{
				if (_stopTime != 0 && _stopTime < video.currentTime)
				{
					_stopTime = 0;
					video.pause();
					return;
				}

				for (var i in _timeCounterStArray)
				{
					if (_timeCounterStArray[i][0] <= video.currentTime && video.currentTime < _timeCounterStArray[i][1])
					{
						if(_learningProgram == 1)
						{
							 $("#" + i).css('display', 'block');
							/*
								Jqueryは、元々非表示になっている要素の下にある要素に対して、toggleを行なっても、display:noneに変更しない。
								その為、最初に台詞がすべて非表示設定になっているType1の画面では、targetLangやownLangのボタンを押して非表示設定にしようとしても
								display:noneというスタイルはあたらず、会話を開始するとすべて表示されてしまう。
								それを回避するため、ボタンの状態を確認して、表示非表示のコントロールを行う。
							 */
							 if($("#targetLangButton").hasClass('buttonoff'))
							 {
								 $("#" + i + " .trgLangDiv").hide();
							 }
							 if($("#ownLangButton").hasClass('buttonoff'))
							 {
								 $("#" + i + " .ownLangDiv").hide();
							 }
							 if($("#pronButton").hasClass('buttonoff'))
							 {
								 $("#" + i + " .pronDiv").hide();
							 }
							 if($("#vocabularyButton").hasClass('buttonoff'))
							 {
								 $("#" + i + " .vocabularyDiv").hide();
							 }
						}else{
							$("#" + i).css('color', 'red');
							
							//スクロールボタンがオンの時だけスクロールさせる
							if($('#textScroll').hasClass('buttonoff') == false)
							{
								//再生中のlineの位置にスクロールさせる
								if(_learningProgram == 2 || _learningProgram == 3){
									
									//現在のlineIdを取得
									var nowLineId = $("#" + i).closest(".lineDiv").attr("id");
									
									//該当の行が非表示＝その話者(Part)の台詞を非表示にしている状態なので、スクロール不要
									if($("#" + nowLineId).css("display") != "none"){
										//#dialogPaneの中でスクロールした数値 + 次に移動したいlineの位置 -#dialogPaneのtopの位置 = 次に移動するスクロールの位置
										//var scrollVal = $('#dialogPane').scrollTop() + $("#" + nowLineId).offset().top - $('#dialogPane').offset().top
										var dtop = $('#dialogPane').position().top
										var scrollVal = $('#dialogPane').scrollTop() + $("#" + i).position().top - dtop
										
										if(i == "st_0_0"){
											//一行目再生の時にスクロール位置が0ではない場合、0にしておく
											if($('#dialogPane').scrollTop() != 0) $('#dialogPane').scrollTop() = 0
										}
										else{ //一行目の時はスクロール処理は不要　
											if(parseInt(scrollVal) != ($('#dialogPane').scrollTop()+20))
											{//既にその位置まで移動している場合はスクロール不要　※+20はpaddingの分
												//if(moveMaxVal > (parseInt(scrollVal)-50)){
												  var speed = 200; // ミリ秒
												  scrollVal = scrollVal - 20;	//あまりギリギリまでスクロールするとテキストが読みにくい
												  $('#dialogPane').animate({scrollTop:scrollVal}, speed, 'swing');
												//}
											}
										}
									}
								}
							}
						}
					}
					else
					{
						if(_learningProgram == 1)
						{
							$("#" + i).css('display', 'none');
						}else{
							$("#" + i).css('color', '');
						}
					}
					
				}
				
			}, false);
		}
	}catch( e ){
	  
	}
});


/*コンテンツの高さ（複数）を計算して返す*/
function contentsouterHeight(ctNames){
	var arr = ctNames.split(",");
	var h = 0;
	
	for(var i=0; i<arr.length; i++){
		h += $(arr[i]).outerHeight({margin: true})
	}
	return h;
}

/*コンテンツの高さと幅調整*/
function changeContentsHeight(){
	var h = $(window).height();
	var w = $(window).width();
	
	//widthリセット
	$(".stsDiv").width("");
	$(".stDataDiv").width("");
	
	//解像度が1024以下（タブレットかスマフォ）か、以上（PC）によってテキスト表示部分の高さを変える
	if(w < 1024)
	{
		$("#dialogPane").css("height", "0");
		
		var contentsHeight = contentsouterHeight("header,#t_path3,#content_box,#footer2");
		var height = h - contentsHeight;
		
		if(_learningProgram != "1")
		{
			if(height < 300) height = 300;
		}
		else
		{
			if(height < 150) height = 150;
		}
		$("#dialogPane").css("height", height);
	}
	else
	{
		var contentsHeight = 0;
		var contentsHeight = contentsouterHeight("header,#t_path3,#content_box,#footer2") - $("#dialogPane").height();
		
		if(_learningProgram == "1")
		{
			$("#dialogPane").css("min-height", "150px");
			$("#dialogPane").css("height", "");
		}
		else
		{
			$("#dialogPane").css("height", h - contentsHeight);
			$("#dialogPane").css("min-height", "367px");
		}
	}

	//テキストスクロールボタンの位置調整
	if(_learningProgram == 2 || _learningProgram == 3){
		var ldcnt = $(".lineDiv").length;
		var outerHeight = 0;
		
		//一時的に消してから高さ計算する必要あり(overflowのスクロールが表示される→テキスト表示部分の横幅を調整してからでないと
		//人物アイコンとチェックボックステキスト表示部分が縦に並んで、#dialogPaneの正確な高さがわからなくなる)
		$(".lineImg").css("display", "none");	
		for(var i=0; i<ldcnt; i++){
			outerHeight = outerHeight + $($(".lineDiv")[i]).outerHeight();
		}
		$(".lineImg").css("display", "block");

		outerHeight = outerHeight-2;
		var right = 0;
		if($("#dialogPane").innerHeight() < outerHeight)
		{
			$("#textScroll").css({
				"position" : "absolute",
				"min-width": "30px",
				"top": $("#dialogPane").position().top, 
				"left": $("#dialogPane").position().left + $("#dialogPane").width() - 50,
				"display": "block"
			});
			$(".stsDiv").width($(".stsDiv").width() - 47);
			$(".stDataDiv").width($(".stDataDiv").width() - 47);
		}
		else{
			$("#textScroll").css("display", "none");
		}
	}
	else
	{
		$(".lineImg").css("display", "none");	
		$("#textScroll").css("display", "none");
	}
}
//index.htmlのコンテンツサイズ変更
function resizeIndexSize(){
	var contentsHeight = contentsouterHeight("header,#t_path3,#footer2") + Number($("#content_box").css("margin-top").split("px")[0]);
	var cboxHeight = contentsouterHeight("#sub01_c_title, #sub_menu, .sub01_c_clm"); //.container #content_boxの内包要素

	if(cboxHeight < $(window).height() - contentsHeight){
		$(".container #content_box").css("height", $(window).height() - contentsHeight);
	};
}

//コンテンツのサイズ変更
//(index.html以外のページ：index.htmlはja_00.html(会話)や00_p.html(発音), 00_v.html(語彙)とは内容が全く違うので別に設定)
function resizeContentsSize(){
	//パターン１を途中まで再生してから他のパターンに切り替えると
	//現状再生していた台詞以外の台詞がdisplay:noneになっているので初期化しておく
	$(".stDiv").css("display", "");
	$("head link")[6].href = "./css/dmod-type" + _learningProgram +".css";
	
	//少し送れて実行しないと、CSSが画面に反映される前にコンテンツの高さを取得してしまう。
	setTimeout(function(){
		changeContentsHeight();
	},200);	
	clearTimeout(timer);
}

function changeType(){
	_learningProgram = parseInt($(this).val());
	resizeContentsSize();
}

/*
 * videoのコントローラではなく、画面上に表示した画像のplayボタンで動画を再生する
 * (動画を非表示にしているパターン２用)
 */
function videoStart(){
	//sentenceかlineを再生中ではない時は、動画を再生出来る
	if(_stopTime==0)
	{
		$('#video_pause').attr("src", "./img/icon_pause.jpg");
		if($('#video_start').attr("src").indexOf("_on") < 0)
		{
			$('#video_start').attr("src", "./img/icon_start_on.jpg");
			video.play()
		}
	}
}
/*
 * videoのコントローラではなく、画面上に表示した画像のplayボタンで動画を一時停止する
 * (動画を非表示にしているパターン２用)
 */
function videoPause(){
	//ビデオが再生中(playボタンで再生したか、sentenceかlineが再生している)
	if($('#video_start').attr("src").indexOf("_on") > 0 || _stopTime > 0)
	{
		video.pause();
		$('#video_pause').attr("src", "./img/icon_pause_on.jpg");
	}
	$('#video_start').attr("src", "./img/icon_start.jpg");
	_stopTime=0;	//自動停止する時間をリセットしておく(sentenceやline単位で再生するとき用の変数)
}
/*
 * videoのコントローラではなく、画面上に表示した画像のplayボタンで動画を停止する
 * (動画を非表示にしているパターン２用)
 */
function videoStop(){
	$('#video_start').attr("src", "./img/icon_start.jpg");
	$('#video_pause').attr("src", "./img/icon_pause.jpg");
	video.currentTime=0;
	video.pause();
	_stopTime=0;	//自動停止する時間をリセットしておく(sentenceやline単位で再生するとき用の変数)
}

function videoReset(){
	$('#video_start').attr("src", "./img/icon_start.jpg");
	$('#video_pause').attr("src", "./img/icon_pause.jpg");
}

/*
 * クリックされたメニューのパターン部分を表示する
 */
function openPatterns(){
	$(this).children('ul').toggle();
}

/*
 * indexページの時、メニューの言語をja/enやfr/enで切り替える
 */
function changeMenuLang(){
	$('.container').toggle();
}
function changeLang(){
	$('.ja-page').toggle();
	$('.en-page').toggle();
}

/*
 * SentenceやLineに設定したCSSをリセットする
 */
function resetLineCss(){
	if(_learningProgram == 1){
		for (var i in _timeCounterLineArray){
			$("#" + i).css('color', 'none');
		}
		for (var i in _timeCounterStArray){
			$("#" + i).css('color', 'none');
		}
	}else{
		for (var i in _timeCounterLineArray){
			$("#" + i).css('color', '');
		}
		for (var i in _timeCounterStArray){
			$("#" + i).css('color', '');
		}
	}
}
/*
 * 文章(Sentence)を再生する
*/

function playSentence(e)
{
    try
    {
		
		videoReset();	//パターン２の場合、videoのcontrollerではなく、playボタンで再生している場合がある。その場合画像などをリセットしておく。
		resetLineCss();
		_timeCounterArray = _timeCounterStArray;
		id = $(this).parent()[0].id;
        video.currentTime = _timeCounterArray[id][0];
        _stopTime = _timeCounterArray[id][1];
        video.play();
		
    } catch (e)
    {
        alert(e);
    }
}


/*
 * 文章(Line)を再生する
*/

function playLine(e)
{
    try
    {
		videoReset();	//パターン２の場合、videoのcontrollerではなく、playボタンで再生している場合がある。その場合画像などをリセットしておく。
		resetLineCss()
		_timeCounterArray = _timeCounterLineArray;
		id = $(this).parent()[0].id;
        video.currentTime = _timeCounterArray[id][0];
        _stopTime = _timeCounterArray[id][1];
        video.play();
    } catch (e)
    {
        alert(e);
    }
}

/*
 *　状況表示コントロール
 */
function toggleSituation() 
{
    $('#situationTxtDiv').slideToggle("slow");
	$('#dispSituation').toggleClass('buttonoff');
	//$('#situationTxtDiv').toggle();
}

/*
 * 登場人物のボタンを押した時に、その人物の台詞の表示/非表示を変更する
 */
function dispTogglePart(e)
{
    var id = $(this).attr("id"); // dispPart_A
	partId = id.substring(id.lastIndexOf("_")+1);
	$(this).toggleClass('buttonoff');
	$('.line' + partId).toggle();
}

/*
 * 学習言語の表示/非表示コントロール＆ボタンの設定変更
 */
function dispTargetToggle()
{
    _targetLangDisp = dispSentenceToggle("trgLangDiv");
	$(this).toggleClass('buttonoff');
	
	//学習言語が非表示で、自分の言語が表示されている時は、登場人物名も自分の言語で表示する
	if($(this).hasClass('buttonoff') && $('#ownLangButton').hasClass('buttonoff') ===false){
		$('.selectPartLabel_p').removeClass('selectPartLabelOff');
		$('.selectPartLabel_t').addClass('selectPartLabelOff');
	}else{
		$('.selectPartLabel_p').addClass('selectPartLabelOff');
		$('.selectPartLabel_t').removeClass('selectPartLabelOff');
	}
}
/*
 * 学習者の言語の表示/非表示コントロール＆ボタンの設定変更
 */
function dispOwnToggle()
{
    _ownLangDisp = dispSentenceToggle("ownLangDiv");
	$(this).toggleClass('buttonoff');
	
	//学習言語が非表示で、自分の言語が表示されている時は、登場人物名も自分の言語で表示する
	if($(this).hasClass('buttonoff') ===false && $('#targetLangButton').hasClass('buttonoff')){
		$('.selectPartLabel_p').removeClass('selectPartLabelOff');
		$('.selectPartLabel_t').addClass('selectPartLabelOff');
	}else{
		$('.selectPartLabel_p').addClass('selectPartLabelOff');
		$('.selectPartLabel_t').removeClass('selectPartLabelOff');
	}

}
/*
 * 発音の表示/非表示コントロール＆ボタンの設定変更
 */
function dispPronToggle()
{
    _pronDisp = dispSentenceToggle("pronDiv");
	$(this).toggleClass('buttonoff');	
}
/*
 * 語彙の表示/非表示コントロール＆ボタンの設定変更
 */
function dispVocabularyToggle()
{
    _vocabularyDisp = dispSentenceToggle("vocabularyDiv");
	$(this).toggleClass('buttonoff');	
}


/*
 * classStrで指定されたsentence部品の表示、非表示の切り替えを行う。
 * classStr：表示、非表示を切り替える例文部品の切り分けにclassを用いる。ex.trgLangDiv,ownLangDiv,pronDiv
 * 戻り値：処理後の表示状態を返す。 
 *
*/
function dispSentenceToggle(classStr) {

    var toggleObjs = $("div[class='"+classStr+"']");
	toggleObjs.each(function ()
	{
		$(this).toggle();
	});
	return false;
  
}


/*
 * Sentenceテキストの表示/非表示のcontrol
 */
function sentenceToggle(e){
	$(this).parent().next().toggle();
}
