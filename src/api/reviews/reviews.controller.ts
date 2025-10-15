import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product review' })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created',
    type: ReviewsEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request — user not customer or not purchased product',
  })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  @ApiBody({ type: CreateReviewDto })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product reviews' })
  @ApiResponse({
    status: 200,
    description: 'List of all reviews',
    type: [ReviewsEntity],
  })
  findAll() {
    return this.reviewsService.findAll();
  }
}
