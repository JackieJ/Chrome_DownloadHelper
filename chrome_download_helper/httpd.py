#!/usr/bin/python
import BaseHTTPServer
import logging
import optparse
import os
import SimpleHTTPServer
import SocketServer
import sys
import urlparse

logging.getLogger().setLevel(logging.INFO)

SERVER_PORT = 8080
SERVER_HOST = ''

SAFE_DIR_COMPONENTS = ['chrome_download_helper'];
SAFE_DIR_SUFFIX = apply(os.path.join, SAFE_DIR_COMPONENTS)

def SanityCheckDirectory():
  if os.getcwd().endswith(SAFE_DIR_SUFFIX):
    return
  logging.error('httpd.py should only be run from the %s', SAFE_DIR_SUFFIX)
  logging.error('directory for testing purposes.')
  logging.error('We are currently in %s', os.getcwd())
  sys.exit(1)

class QuittableHTTPServer(SocketServer.ThreadingMixIn,
                          BaseHTTPServer.HTTPServer):
  def serve_forever(self, timeout=0.5):
    self.is_running = True
    self.timeout = timeout
    while self.is_running:
      self.handle_request()

  def shutdown(self):
    self.is_running = False
    return 1

def KeyValuePair(str, sep='='):
  if sep in str:
    return str.split(sep)
  else:
    return [str, '']

class QuittableHTTPHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    (_, _, _, query, _) = urlparse.urlsplit(self.path)
    url_params = dict([KeyValuePair(key_value)
                      for key_value in query.split('&')])
    if 'quit' in url_params and '1' in url_params['quit']:
      self.send_response(200, 'OK')
      self.send_header('Content-type', 'text/html')
      self.send_header('Content-length', '0')
      self.end_headers()
      self.server.shutdown()
      return

    SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

def Run(server_address,
        server_class=QuittableHTTPServer,
        handler_class=QuittableHTTPHandler):
  httpd = server_class(server_address, handler_class)
  logging.info("Starting local server on port %d", server_address[1])
  logging.info("To shut down send http://localhost:%d?quit=1",
               server_address[1])
  try:
    httpd.serve_forever()
  except KeyboardInterrupt:
    logging.info("Received keyboard interrupt.")
    httpd.server_close()

  logging.info("Shutting down local server on port %d", server_address[1])

if __name__ == '__main__':
  usage_str = "usage: %prog [options] [optional_portnum]"
  parser = optparse.OptionParser(usage=usage_str)
  parser.add_option(
    '--no_dir_check', dest='do_safe_check',
    action='store_false', default=True,
    help='Do not ensure that httpd.py is being run from a safe directory.')
  (options, args) = parser.parse_args(sys.argv)
  if options.do_safe_check:
    SanityCheckDirectory()
  if len(args) > 2:
    print 'Too many arguments specified.'
    parser.print_help()
  elif len(args) == 2:
    Run((SERVER_HOST, int(args[1])))
  else:
    Run((SERVER_HOST, SERVER_PORT))
  sys.exit(0)
