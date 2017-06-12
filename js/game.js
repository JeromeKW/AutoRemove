function gameClass(config){
    var self = this;
    if(!config){
        config = {};
    }

    //矩阵行数
    this.row = config.row || 4;
    //矩阵列数
    this.col = config.col || 4;
    //最低达到多少可消除
    this.minReq = config.minReq || 3;
    //key的前缀标识
    this.preFix = 'L';
    //无效数据
    this.invalidData = 0;
    //矩阵数据
    this.arrayData = [];
    //延迟时间
    this.delay = 500;
    //得分
    this.score = 0;

    //样式配置
    this.clsConfig = ['item1', 'item2', 'item3', 'item4'];

    //元素属性
    this.itemDis = 15;      //间距
    this.itemHeight = 50 + this.itemDis;   //height+间距
    this.itemWidth = 50 + this.itemDis * 2;    //width+2倍的间距

    //初始化
    this.init = function(){
        // self.initHtml();
        self.initData();
        self.findSameEle();
    };

    //数据初始化
    this.initData = function(){
        for(var i=0; i<self.row; i++){
            self.arrayData[i] = [];
            for(var j=0; j<self.col; j++){
                self.arrayData[i][j] = Math.floor(Math.random() * 4) + 1;
            }
        }
        // self.printArray();
        self.initHtml();
    };

    //查找相同元素方法
    this.findSameEle = function(){
        //保存当前局所有相同元素的组合
        self.sameResultArr = [];
        //用于保存与当前元素相同的所有元素
        self.sameArr = [];
        //记录检测元素的状态，该元素是否已经遍历过，以便减少循环次数
        self.checkdEle = {};
        //遍历整个矩阵，查找相同的元素
        for(var i=0; i<self.row; i++){
            for(var j=0; j<self.col; j++){
                if(self.checkdEle[self.preFix + i + j]){ //若该元素已检测过，则跳过
                    continue;
                }
                //查找相同元素的方法
                self.getSameEle(i, j, self.arrayData[i][j]);
                //保存结果
                if(self.sameArr.length >= self.minReq){
                    self.sameResultArr.push(self.sameArr);
                }
                self.sameArr = [];
            }
        }
        setTimeout(function(){
            if(self.sameResultArr.length){
                //消除
                self.removeTheSameEle();
            }else{
                $('#show_score').html('游戏结束，您获得' + self.score + '分<br>刷新页面开启下一局');
                // console.log('最后得分：' + self.score);
                // console.log('Game Over');
            }
        }, self.delay);
    };

    /*
     * 遍历查找相同元素
     * 原理：
     * 判断与当前相邻的四个元素（即：上、下、左、右），是否与当前元素相同
     * 若相同，则继续判断与该相邻元素相邻的四个元素，以此递归查找
     * 在递归过程中，将有相同相邻元素的元素标记为已遍历状态
     */
    this.getSameEle = function(i, j, val){
        //数值转换
        i = i * 1;
        j = j * 1;
        val = val * 1;
        //保存与当前元素相同的相邻元素
        var arr = [];
        //上相邻元素
        if(self.arrayData[i-1] && self.arrayData[i-1][j]){
            //未标记过，且是相同的元素
            if(!self.checkdEle[self.preFix + (i-1) + j] && self.arrayData[i-1][j] == val){
                arr.push((i-1) + '-' + j + '-' + val);  //保存坐标值 row-col-val
                self.setFlag(i-1, j);   //标记状态
            }
        }
        //下相邻元素
        if(self.arrayData[i+1] && self.arrayData[i+1][j]){
            if(!self.checkdEle[self.preFix + (i+1) + j] && self.arrayData[i+1][j] == val){
                arr.push((i+1) + '-' + j + '-' + val);
                self.setFlag(i+1, j);
            }
        }
        //左相邻元素
        if(self.arrayData[i] && self.arrayData[i][j-1]){
            if(!self.checkdEle[self.preFix + i + (j-1)] && self.arrayData[i][j-1] == val){
                arr.push(i + '-' + (j-1) + '-' + val);
                self.setFlag(i, j-1);
            }
        }
        //右相邻元素
        if(self.arrayData[i] && self.arrayData[i][j+1]){
            if(!self.checkdEle[self.preFix + i + (j+1)] && self.arrayData[i][j+1] == val){
                arr.push(i + '-' + (j+1) + '-' + val);
                self.setFlag(i, j+1);
            }
        }
        //有相同元素再继续查找
        if(arr.length){
            self.sameArr = self.sameArr.concat(arr);
            for(var k=0; k<arr.length; k++){
                var paraArr = arr[k].split('-');
                self.getSameEle(paraArr[0], paraArr[1], paraArr[2]);
            }
        }
    };

    //标记状态方法
    this.setFlag = function(i, j){
        self.checkdEle[self.preFix + i + j] = true;
    };

    //消除相同元素
    this.removeTheSameEle = function(){
        //保存所有列位移记录
        self.moveRecord = [];
        //标识出要消除的元素
        for(var i=0; i<self.sameResultArr.length; i++){
            for(var j=0; j<self.sameResultArr[i].length; j++){
                var data = self.sameResultArr[i][j].split('-');
                self.arrayData[data[0]][data[1]] = self.invalidData;
                this.score++;
            }
        }
        // self.printArray();
        self.hideInvlidEle();

        //将已标记的元素进行补位
        for(var col=0; col<self.col; col++){
            //当前列所有位移
            self.curMoveArr = [];
            for(var row=self.row-1; row>=0; row--){
                if(self.arrayData[row][col] == self.invalidData){
                    self.fillCurColInvalidEle(row, col);
                }
            }
            self.moveRecord.push(self.curMoveArr);
        }
        // self.printArray();
        self.moveEffect();
    };

    //列补位
    this.fillCurColInvalidEle = function(row, col){
        for(var i=row-1; i>=0; i--){
            if(self.arrayData[i][col] != self.invalidData){
                self.arrayData[row][col] = self.arrayData[i][col];
                self.arrayData[i][col] = self.invalidData;
                self.curMoveArr.push(i + '-' + row);
                break;
            }
        }
    };

    //消除后全部补全
    this.fillAllInvalidEle = function(){
        for(var i=0; i<self.row; i++){
            for(var j=0; j<self.col; j++){
                if(self.arrayData[i][j] == self.invalidData){
                    var val = Math.floor(Math.random() * 4) + 1;
                    self.arrayData[i][j] = val;
                    $('#L_' + i + j).attr('class', self.clsConfig[self.arrayData[i][j]-1]).slideDown(80);
                }
            }
        }
        // self.printArray();

        setTimeout(function(){
            self.findSameEle();
        }, self.delay);
    };

    //打印矩阵
    this.printArray = function(){
        var str = '';
        for(var i=0; i<self.row; i++){
            for(var j=0; j<self.col; j++){
                str += self.arrayData[i][j] + '  ';
            }
            str += '\n';
        }
        console.log('************');
        console.log(str);
    };


    /*
     * Html渲染部分
     */

    //生成Html矩阵
    this.initHtml = function(){
        var htmlStr = '';
        for(var i=0; i<self.row; i++){
            for(var j=0; j<self.col; j++){
                htmlStr += '<div id="L_'+ i + j +'" class="'+ self.clsConfig[self.arrayData[i][j]-1] +'" style="bottom: '+ ((self.itemHeight*(self.row-i-1)) + self.itemDis) +'px; left: '+ (self.itemWidth*j + self.itemDis) +'px"></div>';
            }
        }
        $('#game_main').html(htmlStr);
    };

    //消除相同的元素
    this.hideInvlidEle = function(){
        for(var col=0; col<self.col; col++){
            for(var row=self.row-1; row>=0; row--){
                if(self.arrayData[row][col] == self.invalidData){
                    // $('#L_' + row + col).attr('class', 'item0');
                    $('#L_' + row + col).slideUp(80, function(){
                        $(this).attr('class', 'item0');
                    });
                }
            }
        }
    };

    //位移效果
    this.moveEffect = function(){
        for(var i=0; i<self.moveRecord.length; i++){
            for(j=0; j<self.moveRecord[i].length; j++){
                var locArr = self.moveRecord[i][j].split('-'),
                    disval = self.itemHeight*(locArr[1]-locArr[0]),
                    targetBottom = self.itemHeight * (self.row-locArr[0]-1) - disval + self.itemDis,
                    sourceBottom = self.itemHeight * (self.row-locArr[1]-1) + disval + self.itemDis,
                    sourceId = 'L_' + locArr[0] + i,
                    targetId = 'L_' + locArr[1] + i,
                    sourceObj = $('#' + sourceId),
                    targetobj = $('#' + targetId);

                sourceObj.attr('id', targetId).animate({'bottom': targetBottom + 'px'}, 300);
                targetobj.attr('id', sourceId).css('bottom', sourceBottom + 'px');
            }
        }

        //空缺位置补全
        setTimeout(function(){
            self.fillAllInvalidEle();
        }, self.delay);
    };

    //开始执行
    this.init();
}

var gameExp = null;
$(function(){
    gameExp = new gameClass();
});