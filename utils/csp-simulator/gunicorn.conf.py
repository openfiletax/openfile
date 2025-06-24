bind = "0.0.0.0:8080"
workers = 4
accesslog = "-"
wsgi_app = "csp_simulator:create_app()"
# One second longer than spring default so that the CSP sim will never time out before our spring apps
timeout = 61
