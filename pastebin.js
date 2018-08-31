'use strict';


module.exports = function(RED) {
    const moment = require('moment');
    const request = require('request-promise');
    const endpoint =  "https://pastebin.com/api";    
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded'}

    function pastebinNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var credentials = RED.nodes.getCredentials(n.id);
    }
    RED.nodes.registerType('pastebin', pastebinNode, {
        credentials: {
          apitoken: { type: 'password' },
          usertoken: { type: 'password' }
        }
    });
    
    
    function pastebinOutNode(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.pastebin = n.pastebin;
        this.format = n.format;
        this.pastename = n.pastename;
        this.exposure = n.exposure;
        this.expire = n.expire;
        this.pastebinConfig = RED.nodes.getNode(this.pastebin);
        
        if (this.pastebinConfig) {
            var node = this;
            var credentials = RED.nodes.getCredentials(this.pastebin);
            
            this.on('input', function(msg) {
                console.log(msg.payload)
                var options = {
                    url: endpoint + '/api_post.php',
                    method: 'POST',
                    headers: headers,
                    form:{
                        'api_option': 'paste',
                        'api_dev_key': credentials.apitoken,
                        'api_paste_private': node.exposure,
                        'api_paste_expire_date': node.expire,
                        'api_paste_name': node.pastename,
                        'api_paste_code': msg.payload,
                        'api_user_key': credentials.usertoken,
                        'api_paste_format': node.format
                    },
                    json: true
                };
                request(options, function(err, res, body) {
                    console.log(body);
                    if (err) {
                        node.error(err);
                        node.status({fill:"red", shape:"ring", text:"pastebin send failed"});
                    } else {
                        msg.payload = body
                        node.send(msg);
                        node.status({});
                    }
                });

            });
        } else {
            this.error('missing pastebin configuration');
            this.status({fill:"red", shape:"ring", text:"not found pastebin config"});
        }
        
    }  
    RED.nodes.registerType("pastebin out", pastebinOutNode);

}