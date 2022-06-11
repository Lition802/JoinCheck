const { segment } = require("oicq");
/** 
* 生成一个GUID
* @returns GUID
*/
function GUID() {
    return 'xxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const id2user = new Map();
var checking = false;

class joinCheck extends NIL.ModuleBase{
    onStart(api){
        NIL.bots.getBot(NIL._vanilla.cfg.self_id).on('notice.group.increase',(e)=>{
            if(e.group_id == NIL._vanilla.cfg.group.main){
                let id = GUID();
                setTimeout(() => {
                    e.group.sendMsg([segment.at(e.user_id,e.nickname),` 请在三十秒内发送验证码：${id}`]);
                }, 3000);
                let user_id = e.user_id;
                checking = true;
                id2user.set(user_id,id);
                setTimeout(() => {
                    if(id2user.has(user_id)){
                        e.group.sendMsg('时间已到！移除群聊')
                        e.group.kickMember(user_id);
                        id2user.delete(user_id);
                        if(id2user.size == 0) checking = false;
                    }
                }, 30*1000);
            }
        });
        api.listen('onMainMessageReceived',(e)=>{
            if(checking){
                if(id2user.has(e.sender.qq)){
                    if(e.raw_message == id2user.get(e.sender.qq)){
                        e.reply('验证成功！',true);
                        id2user.delete(e.sender.qq);
                        if(id2user.size == 0) checking = false;
                    }
                }
            }
        })
    }
    can_be_reload = false;
    can_reload_require = false;
}

module.exports = new joinCheck;