package com.hrmanagement.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoReviewsIU {


    private Long id;
    private LocalDate reviewDate;
    private String reviewerName;
    private String comments;
    private Integer rating;



}
