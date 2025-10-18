import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product review (Customer only)' })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({
    description: 'Review successfully created',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Review successfully created',
        data: {
          id: 1,
          product_id: 10,
          customer_id: 5,
          rating: 5,
          comment: 'Excellent product!',
          created_at: '2025-10-17T12:00:00Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request — user not customer or has not purchased product',
    schema: {
      example: {
        statusCode: 400,
        message: 'User cannot review this product',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product with ID 10 not found',
        error: 'Not Found',
      },
    },
  })
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product reviews' })
  @ApiOkResponse({
    description: 'List of all reviews',
    type: [ReviewsEntity],
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            product_id: 10,
            customer_id: 5,
            rating: 5,
            comment: 'Excellent product!',
            created_at: '2025-10-17T12:00:00Z',
          },
          {
            id: 2,
            product_id: 12,
            customer_id: 6,
            rating: 4,
            comment: 'Good quality but shipping was slow',
            created_at: '2025-10-18T09:30:00Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.reviewsService.findAll();
  }
}
