const fs = require('fs');
const argv = require('yargs').argv;
const parseAscii = require('parse-bmfont-ascii');
const fileName = argv._[0];

const creteFile = file =>{

    fs.writeFile(__dirname+`/${fileName}.xml`, file, function(err) {

        if(err) throw err;

        console.log("The file was created!");

    });

};

class FntToXml {
    constructor({pages=[], chars=[], kerlings=[], info={}, common={}}){
        this.pages = pages;
        this.chars = chars;
        this.kerlings = kerlings;
        this.info = info;
        this.common = common;
    }
    getParams({name="", param=false, tabs=""}) {
        let params = param;
        if(!params){
           params = this[name];
        }
        return  tabs + `<${name} ` + Object.keys(params).map(key=> `${key}=\"${params[key]}\"`).join(" ") +" />";
    };
    createParent({name, children=[], parentParams='', tabs=""}){
        if(!children.length) return;
        return tabs + `<${name}${parentParams}>${children.join("")} ${tabs}</${name}>`
    }
    createElements({name="", arr=[], tabs=""}){
        return arr.map(param=>this.getParams({name, param, tabs}))
    }
    parsePages(){
        return this.pages.map((file, id)=>({id, file}) )
    }
    getXml(){
        return this.createParent({tabs:"\n", name:'font', children:
                [
                    this.getParams({name:'info', tabs:"\n\t"}),
                    this.getParams({name:'common',tabs:"\n\t"}),
                    this.createParent({
                        name:'pages',
                        children:this.createElements({
                            name:'page',
                            arr:this.parsePages(),
                            tabs:"\n\t\t"
                        }),
                        tabs:"\n\t"
                    }),
                    this.createParent({
                        name:'chars',
                        parentParams:` count=\"${this.chars.length}\"`,
                        children:this.createElements({
                            name:'char',
                            arr:this.chars,
                            tabs:"\n\t\t"
                        }),
                        tabs:"\n\t"
                    }),
                    this.createParent({
                        name:'kerlings',
                        parentParams:` count=\"${this.kerlings.length}\"`,
                        children:this.createElements({
                            name:'kerling',
                            arr:this.kerlings,
                            tabs:"\n\t\t"
                        }),
                        tabs:"\n\t"
                    })
            ]}).slice(1)
    }
}

fs.readFile(__dirname+`/${fileName}.fnt`, function(err, data) {
    const converter = new FntToXml( parseAscii(data) );
    const file = converter.getXml();
    creteFile(file);
});


