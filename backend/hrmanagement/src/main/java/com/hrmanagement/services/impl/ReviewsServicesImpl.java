package com.hrmanagement.services.impl;

import java.util.ArrayList;
import java.util.List;

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

        // Kendi kendine değerlendirme kontrolü
        if (dtoReviews.getReviewerId() != null && 
            dtoReviews.getReviewerId().equals(dtoReviews.getEmployeeId())) {
            throw new RuntimeException("Bir çalışan kendisini değerlendiremez!");
        }

        Employees employee = employeesRepository.findById(dtoReviews.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + dtoReviews.getEmployeeId()));

        Reviews reviews = new Reviews();

        reviews.setReviewerName(dtoReviews.getReviewerName());
        reviews.setComments(dtoReviews.getComments());
        reviews.setRating(dtoReviews.getRating());
        reviews.setEmployee(employee);
        reviews.setReviewDate(java.time.LocalDate.now());
        
        Reviews savedReviews = reviewsRepository.save(reviews);
        
        DtoReviews dtoReviewsResponse = new DtoReviews();
        dtoReviewsResponse.setId(savedReviews.getId());
        dtoReviewsResponse.setReviewDate(savedReviews.getReviewDate());
        dtoReviewsResponse.setReviewerName(savedReviews.getReviewerName());
        dtoReviewsResponse.setComments(savedReviews.getComments());
        dtoReviewsResponse.setRating(savedReviews.getRating());
        dtoReviewsResponse.setEmployeeId(savedReviews.getEmployee().getId());
        
        return dtoReviewsResponse;
    }

    @Override
    public DtoReviewsIU updateReviews(Long id , DtoReviewsIU dtoReviewsIU){

        Reviews reviews = reviewsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reviews not found with id: " + id));
        
        reviews.setReviewerName(dtoReviewsIU.getReviewerName());
        reviews.setComments(dtoReviewsIU.getComments());
        reviews.setRating(dtoReviewsIU.getRating());
        
        Reviews updatedReviews = reviewsRepository.save(reviews);
        
        DtoReviewsIU dtoReviewsResponse = new DtoReviewsIU();
        dtoReviewsResponse.setId(updatedReviews.getId());
        dtoReviewsResponse.setReviewDate(updatedReviews.getReviewDate());
        dtoReviewsResponse.setReviewerName(updatedReviews.getReviewerName());
        dtoReviewsResponse.setComments(updatedReviews.getComments());
        dtoReviewsResponse.setRating(updatedReviews.getRating());
        dtoReviewsResponse.setEmployeeId(updatedReviews.getEmployee().getId());
        
        return dtoReviewsResponse;
    }

    @Override
    public void deleteReviews(Long id){
        Reviews reviews = reviewsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reviews not found with id: " + id));
        reviewsRepository.delete(reviews);
    }

    @Override
    public List<DtoReviews> getReviewsByEmployeeId(Long employeeId){
        List<Reviews> reviewsList = reviewsRepository.findByEmployeeId(employeeId);
        List<DtoReviews> dtoReviewsList = new ArrayList<>();
        
        for(Reviews review : reviewsList){
            DtoReviews dto = new DtoReviews();
            dto.setId(review.getId());
            dto.setReviewDate(review.getReviewDate());
            dto.setReviewerName(review.getReviewerName());
            dto.setComments(review.getComments());
            dto.setRating(review.getRating());
            dto.setEmployeeId(review.getEmployee().getId());
            dtoReviewsList.add(dto);
        }
        
        return dtoReviewsList;
    }
}
