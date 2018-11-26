/**
 * config.js
 *
 */

const localhost = 'http://192.168.6.102:4000'
const test = 'http://weeduapi.test.upchina.com'
const product = 'https://weapp.upchina.com/weeduapi'

/*五星股票池列表页地址*/
const five_product = 'https://cdn.upchina.com/front/gudaka/v4/index.html';
const five_test = 'http://cdn.upchina.com/front/gudaka/dev/index.html';
const current = test;
const CDN = five_test;

const config = {
    URL: `${current}`,
    PTNAME: 'TEST_PTPRO_ID',  //拼团产品
    JPKNAME: 'TEST_PTPRODUCT', // 精品课
    /*CDN: "",*/
    CDN: CDN,
    API: {
        // 用户LOGIN
        USER_LOGIN: `${current}/login`,
        // 用户信息
        USER_INFO: `${current}/login/getUserInfo`,
        // 手机号
        USER_PHONE: `${current}/login/getUserPhone`,
        // 查询是否绑定手机号
        USER_FINDPHONE: `${current}/login/findUserPhone`,
        // 建立关系
        // USER_RELATION: `${current}/user/relation`,
        // 分享统计
        USER_SHARESTAT: `${current}/user/shareStat`,
        // 团购列表
        ACT_GROUP: `${current}/group`,
        //团购列表查询 （itemid）
        ACT_FINDGROUP: `${current}/group/find`,
        // 已完成拼团的轮动信息
        ACT_COMPLETELIST: `${current}/group/completeList`,
        //可拼团列表
        ACT_INCOMPLETELIST: `${current}/group/incompleteList`,
        // 我的团购
        ACT_GROUPMYLIST: `${current}/group/myList`,
        // 我的详情
        ACT_GROUPMYDETAIL: `${current}/group/myDetail`,
        // 新增团购
        ACT_GROUPMYCREATE: `${current}/group/myCreate`,
        // 加入团购
        ACT_GROUPMYADD: `${current}/group/myAdd`,
        // 课程
        ACT_VIDEO: `${current}/video`,
        // 课程详情
        ACT_VIDEODETAIL: `${current}/video/detail`,
        //课程章节视频地址
        ACT_VIDEOURL: `${current}/video/play`,
        //精品课支付接口
        ACT_VIDEOPAY: `${current}/wechat/videoOrder`,
        //精品课权限判断
        ACT_VIDEOJUDGE: `${current}/video/order`,
        //订单页面支付
        ACT_ORDERPAY: `${current}/wechat/payOrder`,
        // 观点
        ACT_NEWS: `${current}/news`,
        //股票池权限
        ACT_STOCKPERMIT: `${current}/order/find`,
        // 五星股票池
        ACT_FIVESTARIMG: `${current}/fivestar/fiveStarImg`,
        //首页五星股票数据
        ACT_FIVESTARKLINE: `${current}/fivestar/stockHot`,
        //首页资讯
        ACT_NEWS1: 'https://cdn.upchina.com/acm/newsdetail1/index.html',
        ACT_NEWS2: 'https://cdn.upchina.com/acm/newsdetail2/index.html',
        ACT_NEWS3: 'https://cdn.upchina.com/acm/newsdetail3/index.html',
        //模板消息
        ACT_FORM: `${current}/dcache/update`,
        //分享前股票池
        ACT_NOKLINE: `${current}/fivestar/stockNoKlineList`,
        //分享查看股票池
        ACT_SHARESTOCK: `${current}/order/post`,
        //五星股票池支付
        PAYSTOCK: `${current}/wechat/order`,
        //课程拼团支付
        PAYLESSON: `${current}/wechat/courseOrder`,
        //课程拼团支付验证
        FINDLESSON: `${current}/order/findCourse`,
        //团购支付订单列表
        ORDERLIST: `${current}/wechat/orderList`,
        ZNZGURL: `${current}/v2/search`,
    },
    WORDING: {
        LOADING: '加载中'
    },
    // STORAGE_KEY: {
    //     MY_STOCK: 'MY_STOCK',
    //     MY_STOCK_SEARCH: 'MY_STOCK_SEARCH'
    // },
    SHARE_CONFIG: {
        DEFAULT: {
            title: '邀请你来股大咖，学习大咖精品课程，还能0元拿特权，点击领取>>',
            imageUrl: '/images/share.png',
        },
    },
    //根据拼团列表id判断设置跳转链接
    DETAIL_GROUP: {
        pro1: ['teach_001'],  //产品
        pro2: ['teach_004'], //课程
    },
    GROUP:{
        gcount:2,
    },
    //目前所有订单的productID
        //测试
    TEST_PTPRO_ID : {  //拼团产品的id
        proId:'UPCFJC_20180711172558', //五星股票池
    },
    TEST_PTPRODUCT:[
        {'proId':'UPCFJC_20180830154232','kcId':'627'},//散户如何在A股赚到钱
        {'proId':'UPCFJC_20180904111424_MFTY','kcId':'2182'},//散户如何在A股赚到钱
        {'proId':'UPCFJC_20181023135855','kcId':'628'}, //职业操盘手讲座：炒股入门十堂课
        {'proId':'UPCFJC_20181030220239','kcId':'629',type:'audio'}, //心吾音频课程
        {'proId':'UPCFJC_20181109101656','kcId':'629',type:'audio'}, //心吾音频课程
        {'proId':'UPCFJC_20181102135634','kcId':'631',type:'audio'}, //心吾音频课程试听
        {'proId':'UPCFJC_20181108140501','kcId':'631',type:'audio'}, //心吾音频课程试听
    ],
    PTPRO_ID:{  //拼团产品的id
        'proId':'UPCFJC_20180824155657', //五星股票池
    },
    //正式
    PTPRODUCT:[
        {'proId':'UPCFJC_20180830154804','kcId':'2182'},//散户如何在A股赚到钱
        {'proId':'UPCFJC_20180904111424_MFTY','kcId':'2182'},//散户如何在A股赚到钱
        {'proId':'UPCFJC_20181023135855','kcId':''}, //职业操盘手讲座：炒股入门十堂课
        {'proId':'UPCFJC_20181101190331','kcId':'2392',type:'audio'}, //心吾音频课程   audio 指定音频
        {'proId':'UPCFJC_20181109103204','kcId':'2392',type:'audio'}, //心吾音频课程   audio 指定音频
        {'proId':'UPCFJC_20181102134031','kcId':'2406',type:'audio'}, //心吾音频课程试听
        {'proId':'UPCFJC_20181108110017','kcId':'2406',type:'audio'}, //心吾音频课程试听
    ],
    //课程推荐位
    RECOMMEND: {
        title: '【王心吾短线博弈】从小散到游资的36堂课',
        kcid:'629',
        totalprice: '69800',
        oldprice: '99800',
        economize: '30000',
        imgurl:'https://cdn.upchina.com/front/gudaka/images/banner_xw.jpg'
    },
};

module.exports = config;
