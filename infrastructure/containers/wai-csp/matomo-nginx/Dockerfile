FROM openresty/openresty:1.19.3.1-2-alpine-fat

RUN luarocks install lua-resty-redis-connector

COPY lua/wai-csp.lua /usr/local/openresty/lualib/wai/
