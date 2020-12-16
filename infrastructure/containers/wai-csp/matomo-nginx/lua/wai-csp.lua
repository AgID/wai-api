local ngx_log = ngx.log
local ngx_ERR = ngx.ERR
local ngx_NOTICE = ngx.NOTICE

-- Test if data is an ampty string or null or nil
local function _is_empty(s) 
  return s == nil or s == '' or s == ngx.null
end

local waicsp = {
  _VERSION = '0.0.1',
}

waicsp.__index = waicsp

-- opts = { defaultCsp: ? , redis : { }}
function waicsp.evaluate(opts) 
  local args, err = ngx.req.get_uri_args()
  local cspValue = "frame-ancestors " .. opts.defaultCsp
  if (err ~= "truncated" and args["module"] == "Widgetize" and args["action"] == "iframe" and args["widget"] == "1" and args["idSite"] ~= nil ) then
    local siteId = args["idSite"]
    ngx_log(ngx_NOTICE, "Parameters are ok. CSP procedure activated")
    local rc = require("resty.redis.connector").new()
    local redis, err = rc:connect(opts.redis)
    if err then 
        ngx_log(ngx_ERR, "Unable to connect to redis " .. opts.redis.url)
        ngx_log(ngx_ERR, err)
        ngx.header["Content-Security-Policy"] = cspValue
        return nil, err
    end
    ngx_log(ngx_NOTICE, "Lookup to redis for keys on siteId " .. siteId)
    local siteUrl = redis:get(siteId)
    if(not _is_empty(siteUrl)) then
      cspValue = cspValue .. " " .. siteUrl
    end
    redis:close()
  end
  ngx.header["Content-Security-Policy"] = cspValue
end

return waicsp

  