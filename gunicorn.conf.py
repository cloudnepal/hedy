# This file is used to configure gunicorn,
# used on Heroku.

def worker_exit(server, worker):
    # When the worker is being exited (perhaps because of a timeout),
    # give the query_log handler a chance to flush to disk.
    from website import querylog, user_activity
    import app
    querylog.emergency_shutdown()
    app.parse_logger.emergency_shutdown()
    user_activity.logger.emergency_shutdown()


def post_fork(server, worker):
    """When the worker has started."""
    import app
    app.on_server_start()
