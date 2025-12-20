package com.hrmanagement.services.impl;



import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.hrmanagement.dto.DtoReviews;
import com.hrmanagement.dto.DtoReviewsIU;
import com.hrmanagement.entities.Employees;
import com.hrmanagement.entities.Reviews;
import com.hrmanagement.repository.EmployeesRepository;
import com.hrmanagement.repository.ReviewsRepository;
import com.hrmanagement.services.IReviewsServices;

@Service
public class ReviewsServicesImpl implements IReviewsServices{

    private final EmployeesRepository employeesRepository;
    private final ReviewsRepository reviewsRepository;


    
    public ReviewsServicesImpl(EmployeesRepository employeesRepository,ReviewsRepository reviewsRepository){
        this.employeesRepository = employeesRepository;
        this.reviewsRepository = reviewsRepository;
    }

   @Override
    public DtoReviews addReviews(DtoReviewsIU dtoReviews) {

        Employees employee = employeesRepository.findById(dtoReviews.getId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + dtoReviews.getId()));

        Reviews reviews = new Reviews();

        BeanUtils.copyProperties(dtoReviews, reviews, "id"); 

        reviews.setEmployee(employee);
        
        Reviews savedReviews = reviewsRepository.save(reviews);
        
        DtoReviews dtoReviewsResponse = new DtoReviews();
        BeanUtils.copyProperties(savedReviews, dtoReviewsResponse);
        
        return dtoReviewsResponse;
    }


    @Override
    public DtoReviewsIU updateReviews(Long id , DtoReviewsIU dtoReviewsIU){

        Reviews reviews = reviewsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reviews not found with id: " + id));
        
        Employees employee = employeesRepository.findById(dtoReviewsIU.getId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + dtoReviewsIU.getId()));
        
        BeanUtils.copyProperties(dtoReviewsIU, reviews, "id");
        reviews.setEmployee(employee);
        
        Reviews updatedReviews = reviewsRepository.save(reviews);
        
        DtoReviewsIU dtoReviewsResponse = new DtoReviewsIU();
        BeanUtils.copyProperties(updatedReviews, dtoReviewsResponse);
        
        return dtoReviewsResponse;
    }

    @Override
    public void deleteReviews(Long id){

        Reviews reviews = reviewsRepository.findById(id).orElseThrow(() -> new RuntimeException("Reviews not found with id: " + id));
        Reviews deleteReviews = reviews;

        reviewsRepository.delete(deleteReviews);


    }
}
