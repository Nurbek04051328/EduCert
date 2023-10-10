




class KirilLotin {
    kirlot = (text) => {
        let lat = {
            'a':'а','q':'қ','s':'с','d':'д','e':'э','r':'р','f':'ф','t':'т','g':'г','y':'й',
            'h':'ҳ','u':'у','j':'ж','i':'и','k':'к','o':'о','l':'л','p':'п','z':'з','x':'х',
            's':'с','v':'в','b':'б','n':'н','m':'м','ch':'ч',' ':' ',"g'":"ғ",'sh':'ш',
            'A':'А','Q':'Қ','S':'С','D':'Д','E':'Э','R':'Р','F':'Ф','T':'Т','G':'Г',"G'":"Ғ",
            'Y':'Й','H':'Ҳ','U':'У','J':'Ж','I':'И','K':'К','O':'О','L':'Л','P':'П','Z':"З",
            'X':'Х','S':'С','V':'В','B':'Б','N':'Н','M':'М','Ch':'Ч',"G'":"Ғ",'Sh':'Ш'
        }
        let kir = {
            'а':'a','қ':'q','с':'s','д':'d','е':'e','р':'r','ф':'f','т':'t','г':'g','й':'y',
            'ҳ':'h','у':'u','ж':'j','и':'i','к':'k','о':'o','л':'l','п':'p','з':'z','х':'x',
            'с':'s','в':'v','б':'b','н':'n','м':'m','ш':'sh','ч':'ch', ' ':' ',
            'А': 'A','Қ':'Q','С':'S','Д':"D",'Э':'E','Р':'R','Ф':'F','Т':'T','Г':'G',"Ғ":"G'",
            'Й':'Y','Ҳ':'H','У':'U','Ж':'J','И':'I','К':'K','О':'O','Л':'L','П':'P',"З":'Z',
            'Х':'X','С':'S','В':'V','Б':'B','Н':'N','М':'M','Ч':'Ch',"Ғ":"G'",'Ш':'Sh'
        }
        let res = ''
        if (text) {
            text = text.split('')
            let letterCount = 0
            while (letterCount < text.length) {
                if (text[letterCount]+text[letterCount+1]=='sh') {
                    res+='ш'
                    letterCount+=2
                    continue
                }
                if (text[letterCount]+text[letterCount+1]=='ch') {
                    res+='ч'
                    letterCount+=2
                    continue
                }
                if (text[letterCount]+text[letterCount+1]=='yo') {
                    res+='ё'
                    letterCount+=2
                    continue
                }
                if (text[letterCount]+text[letterCount+1]=='ya') {
                    res+='я'
                    letterCount+=2
                    continue
                }
                if (text[letterCount]+text[letterCount+1]=="o'") {
                    res+='ў'
                    letterCount+=2
                    continue
                }
                if (text[letterCount]+text[letterCount+1]=="g'") {
                    res+='ғ'
                    letterCount+=2
                    continue
                }
                if (lat[text[letterCount]]) {
                    res+=lat[text[letterCount]]
                }
                if (kir[text[letterCount]]) {
                    res+=kir[text[letterCount]]
                }
                letterCount++
            }
            return res
        }
        return text
    }
}

module.exports = new KirilLotin();