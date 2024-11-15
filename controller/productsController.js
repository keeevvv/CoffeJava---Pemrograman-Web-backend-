import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProduct = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      specificSubcategoryId,
      limit = 20, // default limit
      page = 1,
      search,
    } = req.query;

    const where = {};

    if (categoryId) {
      where.categories = {
        some: {
          category_id: parseInt(categoryId), // Use category ID for filtering
        },
      };
    }

    if (subcategoryId) {
      where.subcategories = {
        some: {
          sub_category_id: parseInt(subcategoryId), // Use subcategory ID for filtering
        },
      };
    }

    if (specificSubcategoryId) {
      where.specificSubCategories = {
        some: {
          specific_sub_category_id: parseInt(specificSubcategoryId), // Use specific subcategory ID for filtering
        },
      };
    }

    if (search) {
      where.pName = {
        contains: search,
        
      };
    }

    const totalItems = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      select: {
        product_id: true,
        pName: true,
        categories: {
          select: {
            Category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
        subcategories: {
          select: {
            SubCategory: {
              select: {
                sub_category_id: true,
                sub_category_name: true,
              },
            },
          },
        },
        specificSubCategories: {
          select: {
            SpecificSubCategory: {
              select: {
                specific_sub_category_id: true,
                specific_sub_category_name: true,
              },
            },
          },
        },
        stock: {
          select: {
            stock_id: true,
            size: true,
            quantity: true,
          },
        },
        images: {
          select: { image_url: true },
        },
      },
      take: parseInt(limit),
      skip: (page - 1) * limit,
    });

    const formattedProducts = products.map((product) => ({
      product_id: product.product_id,
      pName: product.pName,
      categories: product.categories.map((c) => ({
        category_id: c.Category.category_id,
        category_name: c.Category.category_name,
      })),
      subCategories: product.subcategories.map((s) => ({
        sub_category_id: s.SubCategory.sub_category_id,
        sub_category_name: s.SubCategory.sub_category_name,
      })),
      specificSubCategories: product.specificSubCategories.map((s) => ({
        specific_sub_category_id:
          s.SpecificSubCategory.specific_sub_category_id,
        specific_sub_category_name:
          s.SpecificSubCategory.specific_sub_category_name,
      })),
      images: product.images.map((i) => i.image_url),
      stock: product.stock.map((s) => ({
        stock_id: s.stock_id,
        size: s.size,
        quantity: s.quantity,
      })),
    }));

    const lastVisiblePage = Math.ceil(totalItems / limit);
    res.status(200).json({
      pagination: {
        last_visible_page: lastVisiblePage,
        has_next_page: page < lastVisiblePage,
        current_page: parseInt(page),
        items: {
          count: products.length,
          total: totalItems,
          per_page: parseInt(limit),
        },
      },
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
