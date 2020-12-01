var http = require('http');
var fs = require('fs');
const port = 80;

//내 주소 알아내기
const my_ip = require("./my_ip");
console.log('내 컴퓨터 주소:',my_ip.my_ip())

//파일 폴더 열기 (내장모듈)
let exec = require('child_process').exec;
exec('Explorer %cd%\\files ', {encoding: 'utf-8'},(err,result,stderr) => {})

//파일 받기 위함 (외부 모듈)
const formidable = require('formidable');
/*
function getFilename(z){
    var a=z.indexOf("filename=\"");//104
    var b=z.indexOf("Content-Type");//121
    return z.substring(a+10,b-3);
}
function getFiledata(z){
    f = z.substr(z.indexOf("Content-Type"))
    return f.substring(f.indexOf("\n")+3,f.indexOf("\n-----------------------------"));
}
*/
function ok(xx){
    var a = `\/:"'?<>|`;
    for (var i=0; i<a.length; i++){
        if (xx.includes(a[i])) return 0;
    }
    return 1;
}
function is(xx){
    if (!xx.includes(`/files/`)) return 0;
    var yy = xx.substr(`/files/`.length);
    if (!ok(yy)) return 0;
    return yy;
}

var server = http.createServer(function (요청, 응답) {

    var _url = 요청.url;
    var _method = 요청.method;
    console.log(decodeURIComponent(_url),_method,요청.connection.remoteAddress);


    if (_url == '/' && _method == "GET") {
        fs.readFile('index.html', 'utf-8', (E, 파일) => {
            var 확장자 = 'text/html; charset=utf-8'
            응답.writeHead(200, {
                'Content-Type': 확장자
            });
            응답.end(파일);
        })

    }else if (_method == 'POST') {
        
        var form = new formidable.IncomingForm();
        
		form.parse(요청, function (err, fields, files) {
            if(err){
                응답.end("it is not file");
                return;
            }
            
            //for (var i in files) console.log('i',i);
            
			var oldpath = files.name.path;
			var newpath = './files/' + files.name.name;
            console.log('야',oldpath,newpath);
		          fs.rename(oldpath, newpath, function (err) {
                      var headcode=200
                    if (err) console.log('post file fs.remame error',err);headcode=404
                    
                      //메인
                   응답.writeHead(headcode, {'Content-Type': 'text/html; charset=utf-8','location':'/'});
                    응답.end("<script>location='/'</script>");
		});
        });
            
        /*
        var post_data = '';
        요청.on('data', (data) => {
            post_data += data;
        });
        요청.on('end', () => {

            //console.log(post_data.substr(0,200));
            var Filename = getFilename(post_data);
            var Filedata = getFiledata(post_data);
            console.log('파일',응답.file);
            console.log('이름:',Filename,'데이터:',Filedata.substr(0,200));
            
            
            
            fs.writeFile('./files/'+Filename, Filedata, null, (E) => {
                console.log('파일', E);
                var 확장자 = 'text/html; charset=utf-8'
                응답.writeHead(200, {'Content-Type': 확장자});
                응답.end("성공");
            });
        })
    */}
    else if(_url=='/html'){
        
         fs.readdir('./files',(E,파일목록)=>{
            var 데이터='';//`<meta name="viewport" content="width=device-width">`;
             
            for (var i=0; i<파일목록.length; i++){
                 데이터+=`<li><a href="./files/${파일목록[i]}">${파일목록[i]}</a></li>`;
            }
             //console.log(데이터,데이터.length.toString());
             //console.log(데이터,데이터.length.toString());
             //out_html.toString().replace(/.mp3/g,"");
            var 확장자 = 'text/html; charset=utf-8';
            응답.writeHead(200, {'Content-Type':확장자,'Accept-Ranges': 'bytes', 'Content-Length':  Buffer.byteLength(데이터, 'utf8').toString()} );
            응답.end(데이터);
        });
    }
    else if(is(decodeURIComponent(_url))){
        
    var file_url=`./files/`+is(decodeURIComponent(_url));
        
       var 확장자='application/octet-stream';
    응답.writeHead(200, {'Content-Type':확장자, 'Accept-Ranges': 'bytes','Content-Transfer-Encoding': 'binary', 'Content-disposition': `attachment; filename="${encodeURIComponent(is(decodeURIComponent(_url)))}"`});
    // 1. stream 생성
    var stream = fs.createReadStream(file_url);
    // 2. 잘게 쪼개진 stream 이 몇번 전송되는지 확인하기 위한 count
    var count = 0;
    var length = 0;
    // 3. 잘게 쪼개진 data를 전송할 수 있으면 data 이벤트 발생 
    stream.on('data', function(data) {
        count++;
        length+=data.length;
        if(!(count%50)) console.log('data count='+count/50);
      // 3.1. data 이벤트가 발생되면 해당 data를 클라이언트로 전송
      응답.write(data);
    });

    // 4. 데이터 전송이 완료되면 end 이벤트 발생
    stream.on('end', function () {
      console.log('end streaming', length);
        
      // 4.1. 클라이언트에 전송완료를 알림
        //response.writeHead(200, {'Content-Length': length.toString()} );
        응답.end();
    });

    // 5. 스트림도중 에러 발생시 error 이벤트 발생
    stream.on('error', function(err) {
      console.log('err');
      // 5.2. 클라이언트로 에러메시지를 전달하고 전송완료
      응답.end('500 Internal Server '+err);
    });
  }
    else{
        응답.writeHead(404);
        응답.end(".");
    }
});

server.listen(port);
console.log(`${port}번 포트에서 실행`)
