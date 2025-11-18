import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
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
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UpdateReviewDto } from './dto/update-review.dto';

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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Get('user')
  @ApiOperation({ summary: 'Get all reviews by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews successfully retrieved',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Reviews not found' })
  findAllByCustomerId(@CurrentUser() user: UsersEntity) {
    return this.reviewsService.findAllByCustomerId(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Successfully fetched review.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Update review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({ status: 200, description: 'Review successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid data provided.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient permissions.',
  })
  update(
    @Body() updateReviewDto: UpdateReviewDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.reviewsService.update(updateReviewDto, id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.reviewsService.delete(id, user);
  }
}
