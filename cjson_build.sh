prefix=/usr/env
mkdir -p $prefix
cd $prefix
wget https://github.com/antirez/redis/archive/5.0.3.tar.gz
tar xvf 5.0.3.tar.gz

# 替换修改之后的 lua_cjson.c
wget https://raw.githubusercontent.com/xiyuan-fengyu/redis-lua-cjson-empty-table-fix/master/lua_cjson.c
yes | cp -rf lua_cjson.c $prefix/redis-5.0.3/deps/lua/src/lua_cjson.c

# 编译
cd $prefix/redis-5.0.3/deps
make hiredis jemalloc linenoise lua
cd $prefix/redis-5.0.3
make
make install

# 准备配置文件
yes | cp -rf redis.conf /etc/
sed -i 's/^bind 127.0.0.1/#bind 127.0.0.1/g' /etc/redis.conf  
sed -i 's/^daemonize no/daemonize yes/g' /etc/redis.conf  
sed -i 's/^# requirepass .*/requirepass 123456/g' /etc/redis.conf  
sed -i 's/^#  notify-keyspace-events Ex/notify-keyspace-events Ex/g' /etc/redis.conf  

# 准备启动程序
yes | cp -rf $prefix/redis-5.0.3/utils/redis_init_script /etc/init.d/redis
sed -i '2s/#/# chkconfig: 2345 90 10/' /etc/init.d/redis 

# 设置开机启动
chkconfig redis on

# 停止 redis
redis-cli -a 123456 shutdown

# 启动 redis
/etc/init.d/redis start
