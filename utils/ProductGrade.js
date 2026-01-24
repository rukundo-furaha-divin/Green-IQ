export async function getProductGrades(products) {
  const scoreToGrade = (score) => {
    if (score >= 80) return "a";
    if (score >= 60) return "b";
    if (score >= 40) return "c";
    if (score >= 20) return "d";
    return "e";
  };

  const normalizeGrade = (grade) => {
    if (!grade || typeof grade !== "string") return null;
    const g = grade.toLowerCase();
    return ["a", "b", "c", "d", "e"].includes(g) ? g : null;
  };

  return products.map((product) => {
    const ecoscoreData = product.ecoscore_data;
    const environmentalData = product.environmental_score_data;

    // 1. Check ecoscore_data.grade
    if (ecoscoreData?.grade) {
      const grade = normalizeGrade(ecoscoreData.grade);
      if (grade) {
        return {
          image: product.image_url,
          code: product.code,
          product_name: product.product_name,
          grade,
        };
      }
    }

    // 2. Check ecoscore_data.score
    if (typeof ecoscoreData?.score === "number") {
      return {
        code: product.code,
        product_name: product.product_name,
        grade: scoreToGrade(ecoscoreData.score),
      };
    }

    // 3. Check ecoscore_grade (top-level)
    if (product.ecoscore_grade) {
      const grade = normalizeGrade(product.ecoscore_grade);
      if (grade) {
        return {
          code: product.code,
          product_name: product.product_name,
          grade,
        };
      }
    }

    // 4. Check ecoscore_score (top-level)
    if (typeof product.ecoscore_score === "number") {
      return {
        code: product.code,
        product_name: product.product_name,
        grade: scoreToGrade(product.ecoscore_score),
      };
    }

    // 5. Check ecoscore_tags
    if (Array.isArray(product.ecoscore_tags)) {
      const validTag = product.ecoscore_tags.find((tag) =>
        ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"].includes(tag)
      );
      if (validTag) {
        return {
          code: product.code,
          product_name: product.product_name,
          grade: validTag.toLowerCase(),
        };
      }
    }

    // 6. FALLBACK: Check environmental_score_data.grade
    if (environmentalData?.grade && environmentalData.grade !== "unknown") {
      const grade = normalizeGrade(environmentalData.grade);
      if (grade) {
        return {
          code: product.code,
          product_name: product.product_name,
          grade,
        };
      }
    }

    // 7. FALLBACK: Check environmental_score_data.score
    if (typeof environmentalData?.score === "number") {
      return {
        code: product.code,
        product_name: product.product_name,
        grade: scoreToGrade(environmentalData.score),
      };
    }

    // 8. FALLBACK: Check environmental_score_score
    if (typeof product.environmental_score_score === "number") {
      return {
        code: product.code,
        product_name: product.product_name,
        grade: scoreToGrade(product.environmental_score_score),
      };
    }

    // 9. FALLBACK: Check environmental_score_tags
    if (Array.isArray(product.environmental_score_tags)) {
      const validTag = product.environmental_score_tags.find((tag) =>
        ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"].includes(tag)
      );
      if (validTag) {
        return {
          code: product.code,
          product_name: product.product_name,
          grade: validTag.toLowerCase(),
        };
      }
    }

    // 10. Default if no valid info found
    return {
      code: product.code,
      product_name: product.product_name,
      grade: "unknown",
    };
  });
}
