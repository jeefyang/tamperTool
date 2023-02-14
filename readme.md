# 自制油猴小工具
### *.开发初衷
#### 有些网页想在网上找现成的脚本又找不到,自己写了一个脚本丢上去是能用了,但是过几天在另外网页有个差不多需求,直接丢之前脚本不行,需要改来改去的,麻烦~~.就萌发了将通用需求改造成一个通用的接口,以后每次遇到了差不多的网页需求就稍微调整脚本接口参数即可,方便你我他
### *.文件说明
#### `src/**/*` ts核心代码,油猴小工具的核心代码,每个文件夹分别代表一个工具.一个文件夹有多个文件的话,估计是这个油猴需要多个文件来配合使用(例如跨域)
#### `test/**/*` 测试小工具的代码,每个文件夹分别代表一个工具测试,与src对应,工具详情使用说明都在此文件夹
#### `debug/**/*` ts核心代码编译js调试输出,测试网页的代码都是从这里获取的
#### `build/**/*` ts核心代码编译js打包输出,要使用核心代码搭建自己的油猴脚本请从这里获取 
#### `tsconfig.json` 配置了全局ts和js开发,从而达到了ts和js都有共同的类型提示,便于开发调试
#### `tsconfig.debug.json` 配置了ts输出调试js代码,仅会输出ts主要代码
#### `tsconfig.debug.json` 配置了ts打包js代码,仅会输出ts主要代码
#### `package.json` 配置了便捷的脚本输出:
###### ---`live` 直接实时网页测试,需要安装`live-server`
###### ---`watch_debug` 触发实时编译ts调试
###### ---`build` 打包编译输出ts核心代码

