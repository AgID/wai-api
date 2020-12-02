vcl 4.0;

import directors;
import std;

backend portal {
    .host = "portal-service";
    .port = "80";
    .first_byte_timeout = 150s;
}

backend matomo {
    .host = "matomo-service";
    .port = "80";
    .first_byte_timeout = 150s;
}

sub vcl_recv {
  if (req.http.X-Backend == "matomo") {
    set req.backend_hint = matomo;
  } else {
    set req.backend_hint = portal;
  }
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }
  if (req.url ~ "^[^?]*\.(7z|avi|bmp|bz2|css|csv|doc|docx|eot|flac|flv|gif|gz|ico|jpeg|jpg|js|png|less|mka|mkv|mov|mp3|mp4|mpeg|mpg|odt|otf|ogg|ogm|opus|pdf|png|ppt|pptx|rar|rtf|svg|svgz|swf|tar|tbz|tgz|ttf|txt|txz|wav|webm|webp|woff|woff2|xls|xlsx|xml|xz|zip)(\?.*)?$") {
    unset req.http.Cookie;
    return (hash);
  }
  if (req.url ~ "\?.*&period=range&" && req.url ~ "\?.*&date=previous30&.*") {
    return (hash);
  }
  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getCss&.*") {
    return (hash);
  }
  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getCoreJs&.*") {
    return (hash);
  }
  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getNonCoreJs&.*") {
    return (hash);
  }
}

sub vcl_hash {
  hash_data(req.url);
  if (req.http.host) {
    hash_data(req.http.host);
  } else {
    hash_data(server.ip);
  }
}

sub vcl_backend_response {
  if (bereq.url ~ "\?.*&period=range&" && bereq.url ~ "\?.*&date=previous30&.*") {
     set beresp.ttl = 360d;
  }
  if (bereq.url ~ "^[^?]*\.(7z|avi|bmp|bz2|css|csv|doc|docx|eot|flac|flv|gif|gz|ico|jpeg|jpg|js|less|mka|mkv|mov|mp3|mp4|mpeg|mpg|odt|otf|ogg|ogm|opus|pdf|png|ppt|pptx|rar|rtf|svg|svgz|swf|tar|tbz|tgz|ttf|txt|txz|wav|webm|webp|woff|woff2|xls|xlsx|xml|xz|zip)(\?.*)?$") {
    unset beresp.http.set-cookie;
    set beresp.ttl = 360d;
    set beresp.http.Cache-Control = "public, max-age=604800, immutable";
  }
  if (beresp.status == 500 || beresp.status == 502 || beresp.status == 503 || beresp.status == 504) {
    return (abandon);
  }
  set beresp.grace = 12h;
  return (deliver);
}

sub vcl_deliver {
  if (obj.hits > 0) {
    set resp.http.X-Cache = "HIT from wai-cache";
  } else {
    set resp.http.X-Cache = "MISS from wai-cache";
  }
  set resp.http.X-Cache-Hits = obj.hits;
  unset resp.http.X-Powered-By;
  unset resp.http.Server;
  unset resp.http.X-Varnish;
  unset resp.http.Via;
  unset resp.http.Pragma;
  unset resp.http.Expires;
  return (deliver);
}
