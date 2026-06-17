import { categoryService } from "./category.service.js";
import { toCategoryDto } from "./category.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await categoryService.list(req.validated.query);
  return sendSuccess(res, { data: items.map(toCategoryDto), meta });
});

const active = asyncHandler(async (req, res) => {
  const cats = await categoryService.active(req.query.section);
  return sendSuccess(res, { data: cats.map(toCategoryDto) });
});

const featured = asyncHandler(async (_req, res) => {
  const cats = await categoryService.featured();
  return sendSuccess(res, { data: cats.map(toCategoryDto) });
});

const getBySlug = asyncHandler(async (req, res) => {
  const cat = await categoryService.getBySlug(req.validated.params.slug);
  return sendSuccess(res, { data: toCategoryDto(cat) });
});

const create = asyncHandler(async (req, res) => {
  const cat = await categoryService.create(req.validated.body);
  return sendSuccess(res, { statusCode: 201, message: "Category created", data: toCategoryDto(cat) });
});

const update = asyncHandler(async (req, res) => {
  const cat = await categoryService.update(req.validated.params.id, req.validated.body);
  return sendSuccess(res, { message: "Category updated", data: toCategoryDto(cat) });
});

const remove = asyncHandler(async (req, res) => {
  const result = await categoryService.remove(req.validated.params.id);
  return sendSuccess(res, { message: "Category deleted", data: result });
});

const categoryController = { list, active, featured, getBySlug, create, update, remove };

export { categoryController };
