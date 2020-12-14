vcl 4.0;

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

acl allowed_purge_net {
    "localhost";
    "10.233.0.0/16";
}

sub vcl_recv {

  if (req.http.X-Backend == "matomo") {
    set req.backend_hint = matomo;
  } else {
    set req.backend_hint = portal;
  }
  
  if (req.method == "BAN") {
    if (!client.ip ~ allowed_purge_net) {
      return (synth(405, "Not allowed"));
    }
    ban("req.http.x-wai-tag == " + req.http.x-wai-tag);
    return (synth(200, "Ban added"));
  }

  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }

  if (req.url ~ "^[^?]*\.(7z|avi|bmp|bz2|css|csv|doc|docx|eot|flac|flv|gif|gz|ico|jpeg|jpg|js|png|less|mka|mkv|mov|mp3|mp4|mpeg|mpg|odt|otf|ogg|ogm|opus|pdf|png|ppt|pptx|rar|rtf|svg|svgz|swf|tar|tbz|tgz|ttf|txt|txz|wav|webm|webp|woff|woff2|xls|xlsx|xml|xz|zip)(\?.*)?$") {
    unset req.http.Cookie;
    set req.http.x-wai-tag = "static";
    return (hash);
  }

  if (req.url ~ "\?.*&period=range&" && req.url ~ "\?.*&date=previous30&.*") {
    set req.http.x-wai-tag = "previous30";
    return (hash);
  }

  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getCss&.*") {
    set req.http.x-wai-tag = "matomo-static";
    return (hash);
  }

  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getCoreJs&.*") {
    set req.http.x-wai-tag = "matomo-static";
    return (hash);
  }

  if (req.url ~ "\?.*module=Proxy&" && req.url ~ "\?.*&action=getNonCoreJs&.*") {
    set req.http.x-wai-tag = "matomo-static";
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
    return(lookup);
}

sub vcl_backend_response {

  set beresp.http.x-wai-tag = bereq.http.x-wai-tag;
  if (bereq.url ~ "\?.*&period=range&" && bereq.url ~ "\?.*&date=previous30&.*") {
    set beresp.ttl = 1d;
  }
  if (bereq.url ~ "^[^?]*\.(7z|avi|bmp|bz2|css|csv|doc|docx|eot|flac|flv|gif|gz|ico|jpeg|jpg|js|less|mka|mkv|mov|mp3|mp4|mpeg|mpg|odt|otf|ogg|ogm|opus|pdf|png|ppt|pptx|rar|rtf|svg|svgz|swf|tar|tbz|tgz|ttf|txt|txz|wav|webm|webp|woff|woff2|xls|xlsx|xml|xz|zip)(\?.*)?$") {
    unset beresp.http.set-cookie;
    set beresp.ttl = 1d;
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

  unset resp.http.x-wai-tag;
  unset resp.http.X-Powered-By;
  unset resp.http.Server;
  unset resp.http.X-Varnish;
  unset resp.http.Via;
  unset resp.http.Pragma;
  unset resp.http.Expires;
  unset resp.http.Age;
  unset resp.http.X-Matomo-Request-Id;
  return (deliver);
}

sub vcl_pipe {
}