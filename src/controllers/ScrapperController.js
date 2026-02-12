const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { Logger, log, loggers } = require("winston");


const axios = require("axios");
const Loggers = require("../utils/Logger");

exports.SearchReviews = catchAsync(async (req, res) => {
  try {

    /* ================================
       1. READ QUERY PARAMS
    =================================*/
    const { university_id, university_name } = req.query;

    if (!university_id || !university_name) {
      return errorResponse(res, "university_id and university_name are required", 400);
    }

    /* ================================
       2. BUILD JSON PAYLOAD
    =================================*/
    const payload = {
      domain: "national",
      experiment: "",
      keyword: university_name
    };

    /* ================================
       3. BASE64 ENCODE
    =================================*/
    const base64Data = Buffer.from(JSON.stringify(payload)).toString("base64");

    /* ================================
       4. BUILD API URL
    =================================*/
    const apiUrl = `https://apis.shiksha.com/apigateway/autosuggestorApi/v1/info/getAutosuggestorResults?data=${base64Data}`;

    /* ================================
       5. HIT API
    =================================*/
    const response = await axios.get(apiUrl, {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.shiksha.com/",
        "Origin": "https://www.shiksha.com",
        "Connection": "keep-alive"
    },
    timeout: 20000
    });
    /* ================================
       6. LOG RESPONSE
    =================================*/
    Loggers.silly({
      university_id,
      university_name,
      encoded_payload: base64Data,
      api_url: apiUrl,
      response: response.data
    });

    /* ================================
       7. RESPONSE TO CLIENT
    =================================*/
    return successResponse(res, "Scrapped reviews fetched successfully", 200, {
      university_id,
      university_name,
      data: response.data
    });

  } catch (error) {
    Loggers.silly({
      error: error.message,
      stack: error.stack
    });

    return errorResponse(res, error.message, 500);
  }
});



exports.GetInstituteData = catchAsync(async (req, res) => {
  try {

    /* ================================
       1. READ QUERY PARAMS
    =================================*/
    const { instituteId, url, university_id } = req.query;

    if (!instituteId || !url || !university_id) {
      return errorResponse(res, "instituteId, url and university_id are required", 400);
    }

    /* ================================
       2. BUILD JSON PAYLOAD
    =================================*/
    const payload = {
      instituteId: Number(instituteId),
      url: url,
      reviewRequestDTO: {}
    };
    /* ================================
    3. BASE64 ENCODE
    =================================*/
    const base64Data = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    /* ================================
    4. BUILD REVIEW API URL
    =================================*/
    const listingUrl = `${url}/reviews`; // important
    const apiUrl = `https://apis.shiksha.com/apigateway/reviewpageapi/v2/info/getReviewPage`
    + `?instituteId=${instituteId}`
    + `&listingUrl=${encodeURIComponent(listingUrl)}`
    + `&pageType=Reviews`
    + `&data=${base64Data}`;
    
    /* ================================
    5. HIT API
    =================================*/
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.shiksha.com/",
        "Origin": "https://www.shiksha.com",
        "Connection": "keep-alive"
      },
      timeout: 20000
    });
    /* ================================
    6. EXTRACT REVIEW DATA
    =================================*/
    const reviewData = response?.data?.data?.reviewData?.reviewTuplesDTO?.reviewData || [];
    
    /* ================================
       SAVE TO DATABASE
    =================================*/
    for (const review of reviewData) {
      await prisma.review.create({
        data: {
          university_id: Number(university_id),
          review_title: review.reviewContent?.reviewTitle || null,
          review_description: review.reviewContent?.reviewDescription || null,
          average_rating: review.averageRating || null,
          infrastructure_rating: review.campusFacilitiesRating || null,
          infrastructure_rating_description: review.reviewContent?.infraDescription || null,
          course_curriculum: review.facultyRating || null,
          course_curriculum_description: review.reviewContent?.facultyDescription || null,
          value_for_money: review.moneyRating || null,
          value_for_money_description: review.reviewContent?.placementDescription || null,
          // is_anonymous: review.anonymous ? 1 : 0,
          created_at: new Date(review.creationDate)
        }
      });
    }
    
    /* ================================
       6. LOG RESPONSE (Uncomment in production, can be verbose)
    =================================*/
    Loggers.http({
      instituteId,
      url,
      listingUrl,
      encoded_payload: base64Data,
      api_url: apiUrl,
      response: response.data,
      reviewData: reviewData.reviewTuplesDTO.reviewData

    });



    /* ================================
       7. RESPONSE TO CLIENT
    =================================*/
    return successResponse(res, "Institute reviews fetched successfully", 200, {
      // instituteId,
      // url,
      // listingUrl,
      // data: response.data,
      reviewData
    });

  } catch (error) {
    Loggers.http({
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error.stack
    });

    return errorResponse(res, error.message, 500);
  }
});
