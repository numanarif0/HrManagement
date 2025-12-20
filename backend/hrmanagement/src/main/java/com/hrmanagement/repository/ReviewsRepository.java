package com.hrmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrmanagement.entities.Reviews;

@Repository
public interface ReviewsRepository extends JpaRepository<Reviews,Long>{

  

}
