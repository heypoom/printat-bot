export function hooksProvider(req, res, next) {
  req.feathers.headers = req.headers

  next()
}
