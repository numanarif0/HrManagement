package com.hrmanagement.controller;

import java.util.List;

import com.hrmanagement.dto.DtoReviews;
import com.hrmanagement.dto.DtoReviewsIU;

public interface IReviewsController {

        public DtoReviews addReviews(DtoReviewsIU dtoReviewsIU);
        public DtoReviewsIU updateReviews(Long id , DtoReviewsIU dtoReviewsIU);
        public void deleteReviews(Long id, Long requesterId);
        public List<DtoReviews> getReviewsByEmployeeId(Long employeeId);

}
