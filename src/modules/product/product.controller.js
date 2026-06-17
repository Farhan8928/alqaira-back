import { productService } from "./product.service.js";
import { toProductDto, toProductCardDto } from "./product.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await productService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toProductCardDto), meta });
});

const adminList = asyncHandler(async (req, res) => {
  const { items, ...meta } = await productService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toProductDto), meta });
});

const featured = asyncHandler(async (_req, res) => {
  const items = await productService.featured();
  return sendSuccess(res, { data: items.map(toProductCardDto) });
});

const newArrivals = asyncHandler(async (_req, res) => {
  const items = await productService.newArrivals();
  return sendSuccess(res, { data: items.map(toProductCardDto) });
});

const getBySlug = asyncHandler(async (req, res) => {
  const { product, related } = await productService.getBySlug(req.validated.params.slug);
  return sendSuccess(res, {
    data: { product: toProductDto(product), related: related.map(toProductCardDto) },
  });
});

const get = asyncHandler(async (req, res) => {
  const product = await productService.get(req.validated.params.id);
  return sendSuccess(res, { data: toProductDto(product) });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "Product created", data: toProductDto(product) });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: "Product updated", data: toProductDto(product) });
});

const remove = asyncHandler(async (req, res) => {
  const result = await productService.remove(req.validated.params.id);
  return sendSuccess(res, { message: "Product deleted", data: result });
});

const productController = {
  list,
  adminList,
  featured,
  newArrivals,
  getBySlug,
  get,
  create,
  update,
  remove,
};

export { productController };
