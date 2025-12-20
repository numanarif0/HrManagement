package com.hrmanagement.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoReviews {


    
    private String reviewerName;
    private String comments;
    private Integer rating;

}
