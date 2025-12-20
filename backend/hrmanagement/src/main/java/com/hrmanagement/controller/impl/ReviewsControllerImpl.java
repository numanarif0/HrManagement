package com.hrmanagement.controller.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrmanagement.controller.IReviewsController;
import com.hrmanagement.dto.DtoReviews;
import com.hrmanagement.dto.DtoReviewsIU;
import com.hrmanagement.services.IReviewsServices;

@RestController
@RequestMapping("api/reviews")
public class ReviewsControllerImpl implements IReviewsController{

    @Autowired
    private IReviewsServices iReviewsServices;

    @Override
    @PostMapping("add")
    public DtoReviews addReviews(@RequestBody DtoReviewsIU dtoReviewsIU){

        return iReviewsServices.addReviews(dtoReviewsIU);
    }

    @Override
    @PutMapping("update/{id}")
    public DtoReviewsIU updateReviews(@PathVariable Long id ,@RequestBody DtoReviewsIU dtoReviewsIU){

        return iReviewsServices.updateReviews(id,dtoReviewsIU);
    }

    @Override
    @DeleteMapping("delete/{id}")
    public void deleteReviews(@PathVariable Long id){
        iReviewsServices.deleteReviews(id);
    }


}